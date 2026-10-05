# Brainbanque Backend

Google Apps Script backend for the Brainbanque platform.

## Architecture

```
React / Vite
     |
     v
Google Apps Script Web App
     |
     +--> Google Sheets (database)
     |
     +--> Google Drive (documents/files)
```

## Setup

1. Open the Brainbanque Apps Script project.
2. Copy `Code.gs` into the Apps Script project.
3. Confirm `CONFIG.DRIVE_ROOT_FOLDER_ID`.
4. Run `setupDriveStructure()` once.
5. Run `initializeDatabase_()` once.
6. Copy the created Spreadsheet ID into `CONFIG.DATABASE_SPREADSHEET_ID`.
7. Deploy the Apps Script project as a Web App.
8. Use the Web App URL as the frontend API base URL.

## Initial API

### Health

`GET ?action=health`

### Services

`GET ?action=services`

### Bootstrap

`GET ?action=bootstrap`

### Enquiry

POST JSON:

```json
{
  "action": "submitEnquiry",
  "data": {
    "name": "Example Name",
    "email": "example@example.com",
    "phone": "+91XXXXXXXXXX",
    "company": "Example Company",
    "service": "Taxation",
    "message": "I would like to discuss a requirement.",
    "source": "Website"
  }
}
```

## Important

Do not place API keys, passwords, OAuth secrets or other credentials in this repository.

Before production, replace the development CORS/origin approach with a controlled production-domain strategy and add authentication/authorization for ERP endpoints.

### ERP CRUD API

GET records:
`GET ?action=list&entity=clients`

Optional exact-match filters:
`GET ?action=list&entity=clients&filters={"Status":"Active"}`

POST create:
```json
{"action":"create","entity":"clients","data":{"Name":"Example Client","Status":"Active"}}
```

POST update:
```json
{"action":"update","entity":"clients","id":"CLI-123","data":{"Status":"Inactive"}}
```

POST delete:
```json
{"action":"delete","entity":"clients","id":"CLI-123"}
```

Supported entities: `settings`, `services`, `enquiries`, `clients`, `contacts`, `users`, `engagements`, `tasks`, `documents`, `auditLog`.

> The generic CRUD endpoints are intended for the internal ERP layer. Authentication/authorization should be added before exposing ERP actions publicly.
