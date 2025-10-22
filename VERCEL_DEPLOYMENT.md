# Vercel Deployment Guide

This guide explains how to deploy your FastAPI backend to Vercel using Docker, with a Supabase PostgreSQL database.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Supabase Database**: Set up a PostgreSQL database at [supabase.com](https://supabase.com)
3. **Vercel CLI** (optional): `npm install -g vercel`

## Deployment Setup

### 1. Supabase Database Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Copy the **Connection String** (URI format)
4. It should look like: `postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

### 2. Environment Variables in Vercel

Set up these environment variables in your Vercel project:

#### Required Variables:
- `DATABASE_URL`: Your Supabase connection string
- `SECRET_KEY`: A secure random string for JWT tokens
- `ENVIRONMENT`: Set to "production"

#### Optional Variables (if not using DATABASE_URL):
- `DB_HOST`: Your Supabase host
- `DB_PORT`: Usually 6543 for Supabase pooler
- `DB_NAME`: Usually "postgres"
- `DB_USER`: Your Supabase username
- `DB_PASSWORD`: Your Supabase password

### 3. Deploy to Vercel

#### Option A: Using Vercel Dashboard
1. Connect your GitHub repository to Vercel
2. Import the project
3. Vercel will automatically detect the `vercel.json` configuration
4. Set the environment variables in the dashboard
5. Deploy!

#### Option B: Using Vercel CLI
```bash
# From the project root directory
vercel

# Follow the prompts to configure your project
# Set environment variables when prompted
```

### 4. Environment Variables Setup

In the Vercel dashboard, go to your project → Settings → Environment Variables and add:

```
DATABASE_URL = postgresql://postgres.xxxxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
SECRET_KEY = your-super-secret-key-here
ENVIRONMENT = production
```

## File Structure

The deployment uses these key files:

- `vercel.json`: Vercel configuration for Docker deployment
- `back/Dockerfile`: Docker container configuration
- `back/src/core/config.py`: Application configuration with Supabase support
- `back/src/database.py`: Database connection setup

## How It Works

1. **Docker Build**: Vercel builds your FastAPI app using the Dockerfile
2. **Database Connection**: The app connects to Supabase using the `DATABASE_URL`
3. **Migrations**: Alembic runs database migrations on startup
4. **API Routes**: All requests are routed to your FastAPI application

## Testing Your Deployment

Once deployed, your API will be available at:
```
https://your-project-name.vercel.app/
```

Test endpoints:
- `GET /` - Health check
- `GET /docs` - API documentation
- `GET /api/...` - Your API endpoints

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**
   - Verify your `DATABASE_URL` is correct
   - Ensure Supabase database is accessible
   - Check that your Supabase project is not paused

2. **Migration Errors**
   - Ensure all required models are imported in `alembic/env.py`
   - Check that your database schema is compatible

3. **Build Failures**
   - Check Vercel build logs for Python/Docker errors
   - Ensure all dependencies are in `requirements.txt`

### Logs and Debugging:
- View deployment logs in the Vercel dashboard
- Use `vercel logs` command for real-time logs
- Check database logs in Supabase dashboard

## Next Steps

1. **Frontend Deployment**: Deploy your Nuxt 3 frontend separately
2. **CORS Configuration**: Update CORS settings for your frontend domain
3. **Custom Domain**: Add a custom domain in Vercel settings
4. **Monitoring**: Set up monitoring and alerts

## Security Notes

- Keep your `SECRET_KEY` secure and unique
- Use environment variables for all sensitive data
- Regularly rotate database passwords
- Enable Supabase Row Level Security (RLS) if needed

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)