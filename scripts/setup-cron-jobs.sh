#!/bin/bash

# Court Vision - Automated Player Stats Sync Cron Setup
# This script helps set up cron jobs for automated player stats sync

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project directory
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
echo -e "${BLUE}🏀 Court Vision - Automated Player Stats Sync Setup${NC}"
echo -e "${BLUE}Project directory: ${PROJECT_DIR}${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Please run this script from the Court Vision project root.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ Error: npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment check passed${NC}"
echo ""

# Test the automated sync script
echo -e "${YELLOW}🧪 Testing automated sync script...${NC}"
cd "$PROJECT_DIR"
if npm run sync-automated > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Automated sync script test passed${NC}"
else
    echo -e "${RED}❌ Automated sync script test failed${NC}"
    echo -e "${YELLOW}Please check your setup and try again.${NC}"
    exit 1
fi

echo ""

# Show cron job options
echo -e "${BLUE}📅 Choose your cron job frequency:${NC}"
echo "1) Every hour (recommended for season)"
echo "2) Every 30 minutes (during active games)"
echo "3) Every 2 hours (offseason)"
echo "4) Custom frequency"
echo "5) Show current cron jobs"
echo "6) Remove existing cron jobs"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        CRON_FREQUENCY="0 * * * *"
        DESCRIPTION="every hour"
        ;;
    2)
        CRON_FREQUENCY="*/30 * * * *"
        DESCRIPTION="every 30 minutes"
        ;;
    3)
        CRON_FREQUENCY="0 */2 * * *"
        DESCRIPTION="every 2 hours"
        ;;
    4)
        echo ""
        echo -e "${YELLOW}Enter custom cron expression (e.g., '0 */4 * * *' for every 4 hours):${NC}"
        read -p "Cron expression: " CRON_FREQUENCY
        DESCRIPTION="custom frequency"
        ;;
    5)
        echo ""
        echo -e "${BLUE}📋 Current cron jobs:${NC}"
        crontab -l 2>/dev/null | grep -i "court_vision\|sync-automated" || echo "No Court Vision cron jobs found"
        exit 0
        ;;
    6)
        echo ""
        echo -e "${YELLOW}🗑️  Removing existing Court Vision cron jobs...${NC}"
        (crontab -l 2>/dev/null | grep -v -i "court_vision\|sync-automated") | crontab -
        echo -e "${GREEN}✅ Existing cron jobs removed${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Create the cron job command
CRON_COMMAND="$CRON_FREQUENCY cd $PROJECT_DIR && npm run sync-automated >> $PROJECT_DIR/logs/cron.log 2>&1"

echo ""
echo -e "${BLUE}📋 Cron job details:${NC}"
echo "Frequency: $DESCRIPTION"
echo "Command: $CRON_COMMAND"
echo ""

read -p "Do you want to add this cron job? (y/n): " confirm

if [[ $confirm =~ ^[Yy]$ ]]; then
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_COMMAND") | crontab -
    
    echo ""
    echo -e "${GREEN}✅ Cron job added successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Monitoring:${NC}"
    echo "- Logs will be saved to: $PROJECT_DIR/logs/"
    echo "- Cron output: $PROJECT_DIR/logs/cron.log"
    echo "- Sync logs: $PROJECT_DIR/logs/player-stats-sync-YYYY-MM-DD.log"
    echo ""
    echo -e "${BLUE}🔧 Management:${NC}"
    echo "- View cron jobs: crontab -l"
    echo "- Edit cron jobs: crontab -e"
    echo "- Remove all Court Vision jobs: Run this script and choose option 6"
    echo ""
    echo -e "${YELLOW}💡 Tips:${NC}"
    echo "- The script automatically detects offseason and adjusts behavior"
    echo "- During offseason, it will still run but expect no games"
    echo "- During season, it will sync any available games from ESPN"
    echo "- Check logs regularly to monitor sync status"
    
else
    echo -e "${YELLOW}❌ Cron job not added${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}" 