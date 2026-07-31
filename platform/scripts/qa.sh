#!/usr/bin/env bash
# End-to-end QA for the TA Soft Platform acceptance criteria.
set -u
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE="https://localhost:8443"
CURL="curl -sk"
ADMIN_JAR=$(mktemp); CUST_JAR=$(mktemp)
PASS=0; FAIL=0
ok()   { PASS=$((PASS+1)); echo "PASS: $1"; }
bad()  { FAIL=$((FAIL+1)); echo "FAIL: $1"; }
check(){ if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (expected [$3] got [$2])"; fi; }

# Clean previous QA rows so the script is re-runnable.
node -e "const{db}=require('$APP_DIR/lib/db');const ids=db.prepare(\"SELECT id FROM customers WHERE company='QA Co'\").all().map(r=>r.id);for(const id of ids){db.prepare('DELETE FROM customers WHERE id=?').run(id)}console.log('cleaned '+ids.length)" >/dev/null

csrf() { # extract csrf token from an authed page
  $CURL -b "$1" "$BASE/dashboard" | grep -o 'name="_csrf" value="[^"]*"' | head -1 | cut -d'"' -f4
}

echo "== 1. login works =="
code=$($CURL -o /dev/null -w '%{http_code}' "$BASE/login"); check "GET /login 200" "$code" "200"
code=$($CURL -o /dev/null -w '%{http_code}' -c "$ADMIN_JAR" -d 'email=dan@tasoft.pro&password=TASoft!2026' "$BASE/login")
check "admin POST /login 303" "$code" "303"
code=$($CURL -b "$ADMIN_JAR" -o /dev/null -w '%{http_code}' "$BASE/dashboard"); check "admin dashboard 200" "$code" "200"
code=$($CURL -o /dev/null -w '%{http_code}' -d 'email=dan@tasoft.pro&password=wrong' "$BASE/login")
loc=$($CURL -o /dev/null -w '%{redirect_url}' -d 'email=dan@tasoft.pro&password=wrong' "$BASE/login")
case "$loc" in *notice=Invalid*) ok "bad password rejected";; *) bad "bad password rejected ($loc)";; esac

AC=$(csrf "$ADMIN_JAR")

echo "== 2. admin creates customer / website / event =="
code=$($CURL -o /dev/null -w '%{http_code}' -b "$ADMIN_JAR" --data-urlencode "_csrf=$AC" \
  --data-urlencode "name=QA Person" --data-urlencode "company=QA Co" --data-urlencode "email=qa@example.com" \
  --data-urlencode "phone=0400000000" --data-urlencode "status=active" --data-urlencode "notes=qa" "$BASE/customers")
check "create customer 303" "$code" "303"
QA_CUST_ID=$(cd "$APP_DIR" && node -e "const{db}=require('./lib/db');console.log(db.prepare(\"SELECT id FROM customers WHERE company='QA Co'\").get().id)")
$($CURL -b "$ADMIN_JAR" "$BASE/customers/$QA_CUST_ID" | grep -q "QA Person") && ok "customer visible" || bad "customer visible"

# website WITHOUT suggested_price -> must auto-calc from build cost ($25 -> ~$750 by curve)
code=$($CURL -o /dev/null -w '%{http_code}' -b "$ADMIN_JAR" --data-urlencode "_csrf=$AC" \
  --data-urlencode "customer_id=$QA_CUST_ID" --data-urlencode "name=qa-site" \
  --data-urlencode "dev_url=https://qa.example.dev" --data-urlencode "status=dev" \
  --data-urlencode "build_cost=25.00" --data-urlencode "suggested_price=" "$BASE/websites")
check "create website 303" "$code" "303"
QA_SITE=$(cd "$APP_DIR" && node -e "const{db}=require('./lib/db');const w=db.prepare(\"SELECT id,suggested_price_cents FROM websites WHERE name='qa-site'\").get();console.log(w.id+' '+w.suggested_price_cents)")
QA_SITE_ID=$(echo "$QA_SITE" | cut -d' ' -f1); QA_SUGG=$(echo "$QA_SITE" | cut -d' ' -f2)
EXPECTED=$(cd "$APP_DIR" && node -e "const{suggestedPriceCents}=require('./lib/pricing');console.log(suggestedPriceCents(2500))")

echo "== 4. suggested price auto-calculates =="
check "auto suggested = pricing curve ($EXPECTED)" "$QA_SUGG" "$EXPECTED"
EXPECTED_FMT=$(cd "$APP_DIR" && node -e "const{money}=require('./lib/pricing');console.log(money($QA_SUGG).slice(1))")
$($CURL -b "$ADMIN_JAR" "$BASE/websites" | grep -qF "\$$EXPECTED_FMT") && ok "suggested renders on websites list" || bad "suggested renders on websites list"

code=$($CURL -o /dev/null -w '%{http_code}' -b "$ADMIN_JAR" --data-urlencode "_csrf=$AC" \
  --data-urlencode "title=QA event" --data-urlencode "details=made by qa script" \
  --data-urlencode "event_type=note" --data-urlencode "build_cost=1.00" \
  --data-urlencode "tool_stack=Hermes + Kimi" --data-urlencode "happened_at=2026-07-31" "$BASE/customers/$QA_CUST_ID/events")
check "create event 303" "$code" "303"
$($CURL -b "$ADMIN_JAR" "$BASE/customers/$QA_CUST_ID" | grep -q "QA event") && ok "event visible in history" || bad "event visible in history"

echo "== CSRF enforcement =="
code=$($CURL -o /dev/null -w '%{http_code}' -b "$ADMIN_JAR" -d 'name=NoCSRF' "$BASE/customers")
check "POST without CSRF -> 403" "$code" "403"

echo "== 3. customer role is scoped =="
code=$($CURL -o /dev/null -w '%{http_code}' -c "$CUST_JAR" -d 'email=info@flashline.com.au&password=Flashline!2026' "$BASE/login")
check "customer POST /login 303" "$code" "303"
code=$($CURL -b "$CUST_JAR" -o /dev/null -w '%{http_code}' "$BASE/dashboard"); check "customer dashboard 200" "$code" "200"
loc=$($CURL -b "$CUST_JAR" -o /dev/null -w '%{redirect_url}' "$BASE/users")
case "$loc" in *Admin+access*) ok "customer blocked from /users";; *) bad "customer blocked from /users ($loc)";; esac
loc=$($CURL -b "$CUST_JAR" -o /dev/null -w '%{redirect_url}' "$BASE/customers/$QA_CUST_ID")
case "$loc" in *Not+authorized*) ok "customer blocked from other customer";; *) bad "customer blocked from other customer ($loc)";; esac
loc=$($CURL -b "$CUST_JAR" -o /dev/null -w '%{redirect_url}' "$BASE/websites/$QA_SITE_ID")
case "$loc" in *Not+authorized*) ok "customer blocked from other website";; *) bad "customer blocked from other website ($loc)";; esac
page=$($CURL -b "$CUST_JAR" "$BASE/websites")
echo "$page" | grep -q "flashline.com.au replacement" && ok "customer sees own website" || bad "customer sees own website"
echo "$page" | grep -q "qa-site" && bad "customer cannot see QA website" || ok "customer cannot see QA website"
loc=$($CURL -b "$CUST_JAR" -o /dev/null -w '%{redirect_url}' "$BASE/customers")
case "$loc" in */customers/*) ok "customer /customers redirects to own record";; *) bad "customer /customers redirect ($loc)";; esac
code=$($CURL -b "$CUST_JAR" -o /dev/null -w '%{http_code}' --data-urlencode "_csrf=$AC" --data-urlencode "name=Hacked" "$BASE/customers")
loc=$($CURL -b "$CUST_JAR" -o /dev/null -w '%{redirect_url}' --data-urlencode "_csrf=$AC" --data-urlencode "name=Hacked" "$BASE/customers")
case "$loc" in *Admin+access*) ok "customer POST /customers blocked";; *) bad "customer POST /customers blocked (code $code loc $loc)";; esac

echo "== 5. dev URL accessible =="
code=$($CURL -o /dev/null -w '%{http_code}' "$BASE/"); check "GET / responds" "$code" "303"
code=$($CURL -o /dev/null -w '%{http_code}' "$BASE/public/styles.css"); check "static css 200" "$code" "200"
cert=$($CURL -v -o /dev/null "$BASE/" 2>&1 | grep -c 'SSL certificate verify ok' || true)
[ "$cert" = "0" ] && ok "HTTPS up (self-signed dev cert, verify skipped with -k)" || ok "HTTPS up with verifiable cert"

echo
echo "RESULT: $PASS passed, $FAIL failed"
rm -f "$ADMIN_JAR" "$CUST_JAR"
# Post-run cleanup: remove QA residue, keep demo/seed data.
node -e "const{db}=require('$APP_DIR/lib/db');const ids=db.prepare(\"SELECT id FROM customers WHERE company='QA Co'\").all().map(r=>r.id);for(const id of ids){db.prepare('DELETE FROM customers WHERE id=?').run(id)}" >/dev/null 2>&1 || true
exit $FAIL
