#!/bin/bash

echo "=== Ce servește Nginx pentru diferite domenii ==="
echo ""

# Testează cu diferite Host headers
echo "1. Test cu Host: sportisia.ro"
curl -s -H "Host: sportisia.ro" http://localhost | head -20
echo ""
echo "---"

echo "2. Test cu Host: www.sportisia.ro"
curl -s -H "Host: www.sportisia.ro" http://localhost | head -20
echo ""
echo "---"

echo "3. Test cu Host: srv1145379.hstgr.cloud"
curl -s -H "Host: srv1145379.hstgr.cloud" http://localhost | head -20
echo ""
echo "---"

echo "4. Test fără Host header (default)"
curl -s http://localhost | head -20
echo ""
echo "---"

echo "5. Verifică ce configurație se potrivește pentru sportisia.ro"
nginx -T 2>/dev/null | grep -A 20 "server_name.*sportisia"

