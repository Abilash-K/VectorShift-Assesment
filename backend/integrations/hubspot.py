# slack.py
from redis_client import add_key_value_redis, get_value_redis, delete_key_redis
import os
import json
import base64
import secrets
import httpx
from fastapi import HTTPException
from fastapi.responses import HTMLResponse
from integrations.integration_item import IntegrationItem
import asyncio
import requests
from dotenv import load_dotenv
from fastapi import Request

load_dotenv()

CLIENT_ID = os.getenv("HUBSPOT_CLIENT_ID")
CLIENT_SECRET = os.getenv("HUBSPOT_CLIENT_SECRET")
REDIRECT_URI = 'http://localhost:8000/integrations/hubspot/oauth2callback'
AUTH_URL = (
    f"https://app.hubspot.com/oauth/authorize"
    f"?client_id={CLIENT_ID}"
    f"&redirect_uri={REDIRECT_URI}"
    f"&scope=crm.objects.contacts.read"
    f"&response_type=code"
)
TOKEN_URL = "https://api.hubapi.com/oauth/v1/token"


async def authorize_hubspot(user_id, org_id):
    """
    Redirects the user to the HubSpot authorization page.
    """
    state_data = {
        'state': secrets.token_urlsafe(32),
        'user_id': user_id,
        'org_id': org_id
    }
    encoded_state = base64.urlsafe_b64encode(json.dumps(state_data).encode('utf-8')).decode('utf-8')
    await add_key_value_redis(f'hubspot_state:{org_id}:{user_id}', json.dumps(state_data), expire=600)
    return f"{AUTH_URL}&state={encoded_state}"


async def oauth2callback_hubspot(request: Request):
    """
    Handles the OAuth2 callback from HubSpot.
    """
    if request.query_params.get('error'):
            raise HTTPException(status_code=400, detail=request.query_params.get('error_description'))
    code = request.query_params.get('code')
    encoded_state = request.query_params.get('state')
    state_data = json.loads(base64.urlsafe_b64decode(encoded_state).decode('utf-8'))

    original_state = state_data.get('state')
    user_id = state_data.get('user_id')
    org_id = state_data.get('org_id')

    saved_state = await get_value_redis(f'hubspot_state:{org_id}:{user_id}')
    if not saved_state or original_state != json.loads(saved_state).get('state'):
        raise HTTPException(status_code=400, detail='State does not match.')

    data = {
        'grant_type': 'authorization_code',
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'redirect_uri': REDIRECT_URI,
        'code': code
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(TOKEN_URL, data=data, headers={
            'Content-Type': 'application/x-www-form-urlencoded'
        })

    if response.status_code != 200:
        raise HTTPException(status_code=400, detail='Failed to get tokens from HubSpot.')

    await asyncio.gather(
        add_key_value_redis(f'hubspot_credentials:{org_id}:{user_id}', response.text, expire=600),
        delete_key_redis(f'hubspot_state:{org_id}:{user_id}')
    )

    close_window_script = """
    <html>
        <script>
            window.close();
        </script>
    </html>
    """
    return HTMLResponse(content=close_window_script)


async def get_hubspot_credentials(user_id, org_id):
    credentials = await get_value_redis(f'hubspot_credentials:{org_id}:{user_id}')
    if not credentials:
        raise HTTPException(status_code=400, detail='No credentials found.')
    await delete_key_redis(f'hubspot_credentials:{org_id}:{user_id}')
    return json.loads(credentials)


def create_integration_item_metadata_object(contact):
    """Creates an IntegrationItem from a HubSpot contact."""
    return IntegrationItem(
        id=contact.get('id'),
        name=(
            (contact.get('properties', {}).get('firstname', '') + ' ' +
             contact.get('properties', {}).get('lastname', '')).strip()
        ),
        type='Contact',
        creation_time=None,
        last_modified_time=None,
        url=None,
        parent_id=None,
        parent_path_or_name=None,
        directory=False,
        children=None,
        mime_type=None,
        delta=None,
        drive_id=None,
        visibility=True,
    )

async def get_items_hubspot(credentials) -> list:
    """
    Fetches contacts from HubSpot and returns as a list of IntegrationItem objects.
    """
    if isinstance(credentials, str):
        credentials = json.loads(credentials)
    access_token = credentials.get('access_token')
    url = "https://api.hubapi.com/crm/v3/objects/contacts"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=400, detail='Failed to fetch contacts from HubSpot.')

    contacts = response.json().get('results', [])
    integration_items = [create_integration_item_metadata_object(contact) for contact in contacts]
    print(f'HubSpot Integration Items: {integration_items}')
    return [item.__dict__ for item in integration_items]