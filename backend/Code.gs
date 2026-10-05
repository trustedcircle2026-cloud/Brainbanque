/**
 * Brainbanque Backend
 * Google Apps Script API
 *
 * Copy this file into the Brainbanque Apps Script project.
 *
 * Architecture:
 * React/Vite -> Apps Script Web App -> Google Sheets / Google Drive
 *
 * No secrets are stored here.
 */

const CONFIG = {
  APP_NAME: 'Brainbanque',

  // Brainbanque master Google Drive folder supplied by the project owner.
  DRIVE_ROOT_FOLDER_ID: '1U-mVhbMH6t3TdVFoLKUY_4BF1MZzcRN9',

  // Add the Google Sheet ID after creating/selecting the master database.
  DATABASE_SPREADSHEET_ID: '18ssVrjnR6fhMkwVcp8zl45scpIbVk15tu4jURgwEous',

  // Allowed origins. Keep '*' during initial development.
  // Restrict this to the production domain before launch.
  ALLOWED_ORIGINS: '*',

  // Set these before production. Leave empty during first-time setup.
  ADMIN_EMAIL: '',
  SESSION_TTL_SECONDS: 21600,

  SHEETS: {
    SETTINGS: 'Settings',
    SERVICES: 'Services',
    ENQUIRIES: 'Enquiries',
    CLIENTS: 'Clients',
    CONTACTS: 'Contacts',
    USERS: 'Users',
    ENGAGEMENTS: 'Engagements',
    TASKS: 'Tasks',
    DOCUMENTS: 'Documents',
    AUDIT_LOG: 'AuditLog'
  }
};

/**
 * GET /exec?action=health
 * GET /exec?action=services
 * GET /exec?action=bootstrap
 */
function doGet(e) {
  try {
    const action = getAction_(e);

    switch (action) {
      case 'health':
        return json_({ success: true, app: CONFIG.APP_NAME, status: 'ok', timestamp: new Date().toISOString() });

      case 'services':
        return json_({ success: true, data: getServices_() });

      case 'bootstrap':
        return json_({ success: true, data: bootstrap_() });

      case 'list':
        return json_({ success: true, data: listRecords_(e.parameter.entity, e.parameter.filters || '', getBearerToken_(e)) });

      case 'me':
        return json_({ success: true, data: getSessionUser_(getBearerToken_(e)) });

      default:
        return json_({ success: false, error: 'Unknown action', action: action }, 400);
    }
  } catch (error) {
    return errorResponse_(error);
  }
}

/**
 * POST /exec
 *
 * Expected body:
 * {
 *   "action": "submitEnquiry",
 *   "data": {
 *     "name": "...",
 *     "email": "...",
 *     "phone": "...",
 *     "company": "...",
 *     "service": "...",
 *     "message": "..."
 *   }
 * }
 */
function doPost(e) {
  try {
    const body = parseBody_(e);
    const action = body.action || '';

    switch (action) {
      case 'submitEnquiry':
        return json_({ success: true, data: submitEnquiry_(body.data || {}) });

      case 'initializeDatabase':
        return json_({ success: true, data: initializeDatabase_() });

      case 'create':
        requireAuth_(body.token, body.entity, 'create');
        return json_({ success: true, data: createRecordAuthenticated_(body.entity, body.data || {}, body.token) });

      case 'update':
        requireAuth_(body.token, body.entity, 'update');
        return json_({ success: true, data: updateRecordAuthenticated_(body.entity, body.id, body.data || {}, body.token) });

      case 'delete':
        return json_({ success: true, data: deleteRecord_(body.entity, body.id, getBearerToken_(e)) });

      case 'login':
        return json_({ success: true, data: login_(body.email, body.password) });

      case 'adminLogin':
        return json_({ success: true, data: adminLogin_(body.password) });

      case 'logout':
        return json_({ success: true, data: logout_(body.token) });

      default:
        return json_({ success: false, error: 'Unknown POST action', action: action }, 400);
    }
  } catch (error) {
    return errorResponse_(error);
  }
}

/* -------------------------------------------------------------------------- */
/* Public API                                                                 */
/* -------------------------------------------------------------------------- */

function getServices_() {
  const sheet = getDatabaseSheet_(CONFIG.SHEETS.SERVICES);

  if (!sheet || sheet.getLastRow() < 2) {
    return getDefaultServices_();
  }

  const rows = readObjects_(sheet);
  return rows
    .filter(function(row) {
      return String(row.Status || 'Active').toLowerCase() === 'active';
    })
    .map(function(row) {
      return {
        id: row.ID || '',
        name: row.Name || '',
        category: row.Category || '',
        description: row.Description || '',
        displayOrder: Number(row.DisplayOrder || 0)
      };
    })
    .sort(function(a, b) {
      return a.displayOrder - b.displayOrder;
    });
}

function submitEnquiry_(input) {
  const data = {
    id: generateId_('ENQ'),
    createdAt: new Date(),
    name: clean_(input.name),
    email: clean_(input.email),
    phone: clean_(input.phone),
    company: clean_(input.company),
    service: clean_(input.service),
    message: clean_(input.message),
    source: clean_(input.source) || 'Website',
    status: 'New'
  };

  if (!data.name) {
    throw new Error('Name is required.');
  }

  if (!data.email && !data.phone) {
    throw new Error('Email or phone number is required.');
  }

  const sheet = getDatabaseSheet_(CONFIG.SHEETS.ENQUIRIES);
  appendObject_(sheet, data);

  logAction_('PUBLIC_ENQUIRY_CREATED', data.id, {
    name: data.name,
    service: data.service
  });

  return {
    id: data.id,
    status: data.status,
    message: 'Thank you. Your enquiry has been received.'
  };
}

/* -------------------------------------------------------------------------- */
/* ERP CRUD API                                                                */
/* -------------------------------------------------------------------------- */

const ENTITY_MAP = {
  settings: CONFIG.SHEETS.SETTINGS,
  services: CONFIG.SHEETS.SERVICES,
  enquiries: CONFIG.SHEETS.ENQUIRIES,
  clients: CONFIG.SHEETS.CLIENTS,
  contacts: CONFIG.SHEETS.CONTACTS,
  users: CONFIG.SHEETS.USERS,
  engagements: CONFIG.SHEETS.ENGAGEMENTS,
  tasks: CONFIG.SHEETS.TASKS,
  documents: CONFIG.SHEETS.DOCUMENTS,
  auditLog: CONFIG.SHEETS.AUDIT_LOG
};

function getEntitySheet_(entity) {
  const key = clean_(entity);
  const sheetName = ENTITY_MAP[key];
  if (!sheetName) throw new Error('Unsupported entity: ' + key);
  const sheet = getDatabaseSheet_(sheetName);
  if (!sheet) throw new Error('Entity sheet not initialized: ' + sheetName);
  return sheet;
}

function listRecords_(entity, filters, token) {
  requireAuth_(token, entity, 'read');
  const sheet = getEntitySheet_(entity);
  let rows = readObjects_(sheet);
  if (filters) {
    try {
      const criteria = JSON.parse(filters);
      rows = rows.filter(function(row) {
        return Object.keys(criteria).every(function(key) {
          return String(row[key] || '').toLowerCase() === String(criteria[key] || '').toLowerCase();
        });
      });
    } catch (ignore) {}
  }
  return rows;
}

function createRecord_(entity, input) {
  const sheet = getEntitySheet_(entity);
  const id = clean_(input.ID || input.id) || generateId_(String(entity).slice(0, 3).toUpperCase());
  const data = Object.assign({}, input, { ID: id, id: id });

  if (!input.CreatedAt && !input.createdAt) {
    data.CreatedAt = new Date();
    data.createdAt = new Date();
  }

  appendObject_(sheet, data);
  logAction_('CREATE_' + String(entity).toUpperCase(), id, data);
  return data;
}

function updateRecord_(entity, id, patch) {
  const sheet = getEntitySheet_(entity);
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) throw new Error('Record not found.');

  const headers = rows[0];
  const idColumn = headers.indexOf('ID') >= 0 ? headers.indexOf('ID') : headers.indexOf('id');
  if (idColumn < 0) throw new Error('Entity has no ID column.');

  for (let r = 1; r < rows.length; r++) {
    if (String(rows[r][idColumn]) === String(id)) {
      Object.keys(patch).forEach(function(key) {
        const c = headers.indexOf(key);
        if (c >= 0) rows[r][c] = patch[key];
      });
      sheet.getRange(r + 1, 1, 1, headers.length).setValues([rows[r]]);
      logAction_('UPDATE_' + String(entity).toUpperCase(), id, patch);
      return readRowObject_(headers, rows[r]);
    }
  }
  throw new Error('Record not found: ' + id);
}

function deleteRecord_(entity, id, token) {
  requireAuth_(token, entity, 'delete');
  const sheet = getEntitySheet_(entity);
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const idColumn = headers.indexOf('ID') >= 0 ? headers.indexOf('ID') : headers.indexOf('id');

  for (let r = 1; r < rows.length; r++) {
    if (String(rows[r][idColumn]) === String(id)) {
      sheet.deleteRow(r + 1);
      logAction_('DELETE_' + String(entity).toUpperCase(), id, {});
      return { id: id, deleted: true };
    }
  }
  throw new Error('Record not found: ' + id);
}

function readRowObject_(headers, row) {
  const object = {};
  headers.forEach(function(header, index) { object[header] = row[index]; });
  return object;
}

/* -------------------------------------------------------------------------- */
/* Authentication & Authorization                                              */
/* -------------------------------------------------------------------------- */

function login_(email, password) {
  email = clean_(email).toLowerCase();
  password = String(password || '');
  if (!email || email.indexOf('@') < 1) throw new Error('Valid work email is required.');
  if (!password) throw new Error('Password is required.');

  const sheet = getDatabaseSheet_(CONFIG.SHEETS.USERS);
  if (!sheet) throw new Error('Users database is not initialized.');
  const rows = readObjects_(sheet);
  const user = rows.find(function(row) {
    return String(row.Email || '').trim().toLowerCase() === email &&
      String(row.Status || 'Active').toLowerCase() === 'active';
  });
  if (!user) throw new Error('Invalid work email or password.');
  if (secureHash_(password) !== String(user.PasswordHash)) throw new Error('Invalid work email or password.');

  const now = new Date();
  updateRecord_('users', user.ID, { LastLogin: now });

  const token = Utilities.getUuid() + '-' + Utilities.getUuid();
  const props = PropertiesService.getScriptProperties();
  const timestamp = Date.now();
  props.setProperty('SESSION_' + token, JSON.stringify({
    token: token,
    email: email,
    name: user.Name || email.split('@')[0],
    role: user.Role || 'Staff',
    createdAt: timestamp,
    expiresAt: timestamp + CONFIG.SESSION_TTL_SECONDS * 1000
  }));

  return {
    token: token,
    user: { email: email, name: user.Name || email.split('@')[0], role: user.Role || 'Staff' },
    expiresAt: new Date(timestamp + CONFIG.SESSION_TTL_SECONDS * 1000).toISOString()
  };
}

function secureHash_(value) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(value), Utilities.Charset.UTF_8);
  return digest.map(function(byte) {
    const v = (byte < 0 ? byte + 256 : byte).toString(16);
    return v.length === 1 ? '0' + v : v;
  }).join('');
}

function adminLogin_(password) {
  const storedPassword = PropertiesService.getScriptProperties().getProperty('DEVELOPER_ADMIN_PASSWORD');
  if (!storedPassword) {
    throw new Error('Administrator password is not configured in Apps Script Script Properties.');
  }
  if (String(password || '') !== String(storedPassword)) {
    throw new Error('Invalid administrator password.');
  }

  const props = PropertiesService.getScriptProperties();
  const token = Utilities.getUuid() + '-' + Utilities.getUuid();
  const now = Date.now();
  const email = clean_(CONFIG.ADMIN_EMAIL) || 'admin@brainbanque.in';
  const name = 'Administrator';

  props.setProperty('SESSION_' + token, JSON.stringify({
    token: token,
    email: email,
    name: name,
    role: 'Admin',
    createdAt: now,
    expiresAt: now + CONFIG.SESSION_TTL_SECONDS * 1000
  }));

  return {
    token: token,
    user: { email: email, name: name, role: 'Admin' },
    expiresAt: new Date(now + CONFIG.SESSION_TTL_SECONDS * 1000).toISOString()
  };
}

function logout_(token) {
  if (token) PropertiesService.getScriptProperties().deleteProperty('SESSION_' + token);
  return { loggedOut: true };
}

function getBearerToken_(e) {
  const header = e && e.parameter ? e.parameter.token : '';
  return clean_(header);
}

function getSessionUser_(token) {
  const session = readSession_(token);
  if (!session) throw new Error('Session expired or invalid.');
  return { email: session.email, name: session.name, role: session.role, expiresAt: new Date(session.expiresAt).toISOString() };
}

function readSession_(token) {
  if (!token) return null;
  const raw = PropertiesService.getScriptProperties().getProperty('SESSION_' + token);
  if (!raw) return null;
  const session = JSON.parse(raw);
  if (Date.now() > Number(session.expiresAt)) {
    PropertiesService.getScriptProperties().deleteProperty('SESSION_' + token);
    return null;
  }
  return session;
}

function requireAuth_(token, entity, action) {
  const session = readSession_(token);
  if (!session) throw new Error('Authentication required.');

  const adminOnly = ['users', 'settings', 'auditLog'];
  if (adminOnly.indexOf(entity) >= 0 && session.role !== 'Admin') {
    throw new Error('Administrator access required.');
  }

  if (action === 'delete' && session.role !== 'Admin') {
    throw new Error('Administrator access required to delete records.');
  }

  return session;
}

/* -------------------------------------------------------------------------- */
/* Database                                                                    */
/* -------------------------------------------------------------------------- */

function initializeDatabase_() {
  const spreadsheet = getDatabaseSpreadsheet_();

  Object.keys(CONFIG.SHEETS).forEach(function(key) {
    const sheetName = CONFIG.SHEETS[key];
    const headers = getHeadersForSheet_(sheetName);

    let sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
    } else {
      const existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String);
      headers.forEach(function(header) {
        if (existingHeaders.indexOf(header) < 0) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(header);
        }
      });
    }
  });

  seedServices_();

  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetUrl: spreadsheet.getUrl(),
    sheets: Object.keys(CONFIG.SHEETS).map(function(key) {
      return CONFIG.SHEETS[key];
    })
  };
}

function getDatabaseSpreadsheet_() {
  if (CONFIG.DATABASE_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(CONFIG.DATABASE_SPREADSHEET_ID);
  }

  // Development convenience:
  // create the master database inside the configured Drive folder.
  const root = DriveApp.getFolderById(CONFIG.DRIVE_ROOT_FOLDER_ID);
  const iterator = root.getFilesByName(CONFIG.APP_NAME + ' - Master Database');

  if (iterator.hasNext()) {
    return SpreadsheetApp.open(iterator.next());
  }

  const spreadsheet = SpreadsheetApp.create(CONFIG.APP_NAME + ' - Master Database');
  const file = DriveApp.getFileById(spreadsheet.getId());

  root.addFile(file);

  // Remove the file from My Drive root when possible.
  try {
    DriveApp.getRootFolder().removeFile(file);
  } catch (ignore) {}

  return spreadsheet;
}

function getDatabaseSheet_(sheetName) {
  return getDatabaseSpreadsheet_().getSheetByName(sheetName);
}

function appendObject_(sheet, object) {
  if (!sheet) {
    throw new Error('Database sheet not found.');
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const values = headers.map(function(header) {
    return object[header] !== undefined ? object[header] : '';
  });

  sheet.appendRow(values);
}

function readObjects_(sheet) {
  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];

  return values.slice(1).map(function(row) {
    const object = {};

    headers.forEach(function(header, index) {
      object[header] = row[index];
    });

    return object;
  });
}

/* -------------------------------------------------------------------------- */
/* Database schema                                                             */
/* -------------------------------------------------------------------------- */

function getHeadersForSheet_(sheetName) {
  const schemas = {};

  schemas[CONFIG.SHEETS.SETTINGS] = [
    'Key', 'Value', 'Description', 'UpdatedAt'
  ];

  schemas[CONFIG.SHEETS.SERVICES] = [
    'ID', 'Name', 'Category', 'Description', 'DisplayOrder', 'Status'
  ];

  schemas[CONFIG.SHEETS.ENQUIRIES] = [
    'id', 'createdAt', 'name', 'email', 'phone', 'company',
    'service', 'message', 'source', 'status'
  ];

  schemas[CONFIG.SHEETS.CLIENTS] = [
    'ID', 'CreatedAt', 'Name', 'EntityName', 'Email', 'Phone',
    'Category', 'Status', 'AssignedTo', 'Notes'
  ];

  schemas[CONFIG.SHEETS.CONTACTS] = [
    'ID', 'ClientID', 'Name', 'Designation', 'Email', 'Phone',
    'Status', 'Notes'
  ];

  schemas[CONFIG.SHEETS.USERS] = [
    'ID', 'CreatedAt', 'Name', 'Email', 'PasswordHash', 'Role', 'Status', 'LastLogin'
  ];

  schemas[CONFIG.SHEETS.ENGAGEMENTS] = [
    'ID', 'CreatedAt', 'ClientID', 'Title', 'Service',
    'AssignedTo', 'StartDate', 'DueDate', 'Status', 'Priority', 'Notes'
  ];

  schemas[CONFIG.SHEETS.TASKS] = [
    'ID', 'CreatedAt', 'EngagementID', 'Title', 'AssignedTo',
    'DueDate', 'Status', 'Priority', 'Notes'
  ];

  schemas[CONFIG.SHEETS.DOCUMENTS] = [
    'ID', 'CreatedAt', 'ClientID', 'EngagementID', 'FileName',
    'DriveFileId', 'FolderId', 'DocumentType', 'UploadedBy', 'Status'
  ];

  schemas[CONFIG.SHEETS.AUDIT_LOG] = [
    'Timestamp', 'Action', 'ReferenceID', 'Details'
  ];

  return schemas[sheetName] || ['ID', 'CreatedAt'];
}

function seedServices_() {
  const sheet = getDatabaseSheet_(CONFIG.SHEETS.SERVICES);

  if (!sheet || sheet.getLastRow() > 1) {
    return;
  }

  const services = getDefaultServices_();

  const rows = services.map(function(service) {
    return [
      service.id,
      service.name,
      service.category,
      service.description,
      service.displayOrder,
      'Active'
    ];
  });

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

function getDefaultServices_() {
  return [
    {
      id: 'SRV-001',
      name: 'Accounting & Finance',
      category: 'Finance',
      description: 'Accounting, financial reporting and finance support.',
      displayOrder: 1
    },
    {
      id: 'SRV-002',
      name: 'Taxation',
      category: 'Tax',
      description: 'Direct tax, indirect tax and related advisory support.',
      displayOrder: 2
    },
    {
      id: 'SRV-003',
      name: 'Audit & Assurance',
      category: 'Assurance',
      description: 'Audit, assurance and financial review support.',
      displayOrder: 3
    },
    {
      id: 'SRV-004',
      name: 'Corporate & Secretarial',
      category: 'Corporate',
      description: 'Company secretarial and corporate compliance support.',
      displayOrder: 4
    },
    {
      id: 'SRV-005',
      name: 'Legal Support',
      category: 'Legal',
      description: 'Coordinated legal and documentation support.',
      displayOrder: 5
    },
    {
      id: 'SRV-006',
      name: 'Business Advisory',
      category: 'Advisory',
      description: 'Business, financial and strategic advisory support.',
      displayOrder: 6
    },
    {
      id: 'SRV-007',
      name: 'Compliance & Outsourcing',
      category: 'Operations',
      description: 'Recurring compliance and outsourced professional operations.',
      displayOrder: 7
    }
  ];
}

/* -------------------------------------------------------------------------- */
/* Drive                                                                       */
/* -------------------------------------------------------------------------- */

function getDriveRoot_() {
  return DriveApp.getFolderById(CONFIG.DRIVE_ROOT_FOLDER_ID);
}

function getOrCreateFolder_(parent, name) {
  const folders = parent.getFoldersByName(name);

  if (folders.hasNext()) {
    return folders.next();
  }

  return parent.createFolder(name);
}

/**
 * Creates the recommended Brainbanque Drive structure.
 * Can be called from Apps Script manually:
 * setupDriveStructure()
 */
function setupDriveStructure() {
  const root = getDriveRoot_();

  [
    '01 - Database',
    '02 - Documents',
    '03 - App Script',
    '04 - Branding',
    '05 - Templates',
    '06 - Backup'
  ].forEach(function(name) {
    getOrCreateFolder_(root, name);
  });

  const documents = getOrCreateFolder_(root, '02 - Documents');

  [
    'Client Documents',
    'Engagement Documents',
    'Agreements',
    'Reports',
    'Internal'
  ].forEach(function(name) {
    getOrCreateFolder_(documents, name);
  });

  const branding = getOrCreateFolder_(root, '04 - Branding');

  [
    'Logo',
    'Brand Assets',
    'Documents'
  ].forEach(function(name) {
    getOrCreateFolder_(branding, name);
  });

  return 'Brainbanque Drive structure initialized.';
}

/* -------------------------------------------------------------------------- */
/* Bootstrap                                                                   */
/* -------------------------------------------------------------------------- */

function bootstrap_() {
  const spreadsheet = getDatabaseSpreadsheet_();

  return {
    app: CONFIG.APP_NAME,
    version: '0.1.0',
    database: {
      spreadsheetId: spreadsheet.getId(),
      spreadsheetUrl: spreadsheet.getUrl()
    },
    services: getServices_(),
    drive: {
      rootFolderId: CONFIG.DRIVE_ROOT_FOLDER_ID
    }
  };
}

/* -------------------------------------------------------------------------- */
/* Logging                                                                     */
/* -------------------------------------------------------------------------- */

function logAction_(action, referenceId, details) {
  try {
    const sheet = getDatabaseSheet_(CONFIG.SHEETS.AUDIT_LOG);

    if (!sheet) {
      return;
    }

    sheet.appendRow([
      new Date(),
      action,
      referenceId || '',
      JSON.stringify(details || {})
    ]);
  } catch (ignore) {
    // Logging must never break the primary request.
  }
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                   */
/* -------------------------------------------------------------------------- */

function getAction_(e) {
  if (!e || !e.parameter) {
    return 'health';
  }

  return e.parameter.action || 'health';
}

function parseBody_(e) {
  if (!e || !e.postData || !e.postData.contents) {
    return {};
  }

  const raw = e.postData.contents;

  try {
    return JSON.parse(raw);
  } catch (error) {
    throw new Error('Request body must be valid JSON.');
  }
}

function clean_(value) {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

function generateId_(prefix) {
  return prefix + '-' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone() || 'Asia/Kolkata',
      'yyyyMMddHHmmss'
    ) +
    '-' +
    Math.floor(1000 + Math.random() * 9000);
}

function json_(data, statusCode) {
  // Apps Script ContentService does not expose arbitrary HTTP status codes
  // consistently, so statusCode is retained for future API middleware.
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse_(error) {
  console.error(error);

  return json_({
    success: false,
    error: error && error.message
      ? error.message
      : String(error)
  }, 500);
}

/**
 * Manual first-time setup:
 *
 * 1. Run setupDriveStructure()
 * 2. Run initializeDatabase_()
 * 3. Copy the generated Spreadsheet ID into CONFIG.DATABASE_SPREADSHEET_ID
 * 4. Deploy as Web App
 *
 * For a clean public deployment, use:
 * Execute as: Me
 * Who has access: Anyone
 */

function createRecordAuthenticated_(entity, input, token) {
  const session = requireAuth_(token, entity, 'create');
  if (entity === 'users') {
    if (session.role !== 'Admin') throw new Error('Administrator access required.');
    const data = Object.assign({}, input);
    const password = String(data.Password || '');
    delete data.Password;
    if (!password) throw new Error('User password is required.');
    data.PasswordHash = secureHash_(password);
    data.Role = data.Role || 'Staff';
    data.Status = data.Status || 'Active';
    return createRecord_(entity, data);
  }
  return createRecord_(entity, input);
}

function updateRecordAuthenticated_(entity, id, patch, token) {
  requireAuth_(token, entity, 'update');
  return updateRecord_(entity, id, patch);
}
