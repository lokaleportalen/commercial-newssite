#!/bin/bash
# Test Mailgun API directly with curl

source .env

echo "Testing Mailgun with curl..."
echo "Domain: $MAILGUN_DOMAIN"
echo "API Key: ${MAILGUN_API_KEY:0:15}..."
echo ""

curl -v --user "api:$MAILGUN_API_KEY" \
  https://api.eu.mailgun.net/v3/$MAILGUN_DOMAIN/messages \
  -F from="Estate News <noreply@$MAILGUN_DOMAIN>" \
  -F to="ek@digitaldisruptionmedia.com" \
  -F subject="Test Email from Mailgun" \
  -F text="This is a test email to verify Mailgun integration."
