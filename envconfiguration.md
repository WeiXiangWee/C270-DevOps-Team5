# Environment Configuration

The application requires environment variables to connect with external services such as the database, email service, and n8n automation workflow.

The actual .env file is excluded from the submission because it contains sensitive credentials.

Create a .env file in the project root directory and configure the following variables.

## Database Configuration

DB_HOST=&lt;Your_RDS_Endpoint&gt;
DB_USER=&lt;Your_Database_Username&gt;
DB_PASSWORD=&lt;Your_Database_Password&gt;
DB_NAME=&lt;Your_Database_Name&gt;
DB_PORT=3306

## Email Configuration

EMAIL_USER=&lt;Your_Email_Address&gt;
EMAIL_PASS=&lt;Your_Email_App_Password&gt;​

## n8n Webhook Configuration

N8N_MAINTENANCE_WEBHOOK=&lt;Your_n8n_Webhook_URL&gt;

​

​

## Example .env File

DB_HOST=your_rds_endpoint
DB_USER=your_database_username
DB_PASSWORD=your_database_password
DB_NAME=c270
DB_PORT=3306
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_passwordN8N_MAINTENANCE_WEBHOOK=your_n8n_webhook_url



