#!/usr/bin/env bash

set -euo pipefail

SRC_USER="bitnamilegacy"
DEST_USER="helmhubio"

# -------------------------------------------------------------------
# 🔐 Docker login credentials (set these before running)
# -------------------------------------------------------------------

DOCKER_USER="${DOCKER_USER:-}"
DOCKER_PASS="${DOCKER_PASS:-}"

if [ -z "$DOCKER_USER" ] || [ -z "$DOCKER_PASS" ]; then
  echo "❌ Missing Docker credentials!"
  echo "Please export DOCKER_USER and DOCKER_PASS before running this script."
  echo "Example:"
  echo "  export DOCKER_USER='helmhubio'"
  echo "  export DOCKER_PASS='your-docker-access-token'"
  exit 1
fi

# -------------------------------------------------------------------
# 🧰 Dependency check
# -------------------------------------------------------------------
for cmd in curl jq docker; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Missing dependency: $cmd"
    exit 1
  fi
done

# -------------------------------------------------------------------
# 🔁 [NEW] Retry Helper Function
# -------------------------------------------------------------------
retry() {
  local cmd=$1
  local max_retries=${2:-3}
  local delay=${3:-5}
  local count=0

  until eval "$cmd"; do
    count=$((count + 1))
    if [ $count -ge $max_retries ]; then
      echo "❌ Command failed after ${max_retries} attempts: $cmd"
      return 1
    fi
    echo "⚠️  Retry ${count}/${max_retries} for: $cmd (waiting ${delay}s)"
    sleep "$delay"
  done
}

# -------------------------------------------------------------------
# 🔑 Login to Docker Hub
# -------------------------------------------------------------------
echo "🔐 Logging into Docker Hub as ${DOCKER_USER}..."
echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin >/dev/null 2>&1 || {
  echo "❌ Docker login failed. Please check your credentials."
  exit 1
}
echo "✅ Docker login successful!"

# -------------------------------------------------------------------
# 📦 Fetch all repositories from the source user
# -------------------------------------------------------------------
echo "🔍 Fetching all repositories for ${SRC_USER}..."
REPOS=()
URL="https://hub.docker.com/v2/repositories/${SRC_USER}/?page_size=100"

while [ -n "$URL" ] && [ "$URL" != "null" ]; do
  echo "📥 Fetching from: $URL"
  RESP=$(retry "curl -s \"$URL\"" 3 5)
  NAMES=$(echo "$RESP" | jq -r '.results[].name')
  REPOS+=($NAMES)
  URL=$(echo "$RESP" | jq -r '.next')
done

if [ ${#REPOS[@]} -eq 0 ]; then
  echo "❌ No repositories found for ${SRC_USER}"
  exit 1
fi

echo "✅ Found ${#REPOS[@]} repositories to migrate."

# -------------------------------------------------------------------
# 🚀 Start migration process
# -------------------------------------------------------------------
for REPO in "${REPOS[@]}"; do
  echo ""
  echo "🚀 Processing repository: ${REPO}"

  TAGS_URL="https://hub.docker.com/v2/repositories/${SRC_USER}/${REPO}/tags?page_size=100"
  
  # [NEW] Retry fetching tags
  TAGS_JSON=$(retry "curl -s \"$TAGS_URL\"" 3 5)

  # 🧠 Filter out sha256-* tags and sort by last_updated (newest first)
  LATEST_TAG=$(echo "$TAGS_JSON" \
    | jq -r '.results 
      | map(select(.name | startswith("sha256-") | not)) 
      | sort_by(.last_updated) 
      | reverse 
      | .[0].name' 2>/dev/null || echo "")

  if [ "$LATEST_TAG" = "null" ] || [ -z "$LATEST_TAG" ]; then
    echo "⚠️  No valid (non-sha) tags found for ${REPO}, skipping."
    continue
  fi

  SRC_IMAGE="${SRC_USER}/${REPO}:${LATEST_TAG}"
  DEST_IMAGE="${DEST_USER}/${REPO}:${LATEST_TAG}"

  # -------------------------------------------------------------------
  # 🔍 Check if image already exists in DEST_USER registry
  # -------------------------------------------------------------------
  CHECK_URL="https://hub.docker.com/v2/repositories/${DEST_USER}/${REPO}/tags/${LATEST_TAG}/"
  EXISTS=$(curl -s -o /dev/null -w "%{http_code}" "$CHECK_URL")

  if [ "$EXISTS" -eq 200 ]; then
    echo "⏭️  ${DEST_IMAGE} already exists — skipping migration."
    continue
  fi

  echo "📦 Using most recent real tag: ${LATEST_TAG}"

  # -------------------------------------------------------------------
  # 📥 Pull, tag, and push (with retries)
  # -------------------------------------------------------------------

  echo "📥 Pulling ${SRC_IMAGE}..."
  if ! retry "docker pull \"$SRC_IMAGE\"" 3 10; then
    echo "❌ Failed to pull ${SRC_IMAGE}, skipping."
    continue
  fi

  echo "🔁 Retagging ${SRC_IMAGE} → ${DEST_IMAGE}..."
  if ! docker tag "$SRC_IMAGE" "$DEST_IMAGE"; then
    echo "❌ Failed to tag ${SRC_IMAGE}, skipping."
    continue
  fi

  echo "☁️  Pushing ${DEST_IMAGE}..."
  if ! retry "docker push \"$DEST_IMAGE\"" 3 10; then
    echo "❌ Failed to push ${DEST_IMAGE}, skipping."
    continue
  fi

  echo "✅ Successfully migrated ${REPO}:${LATEST_TAG}"

  echo "🧹 Cleaning up local images..."
  docker rmi "$SRC_IMAGE" "$DEST_IMAGE" >/dev/null 2>&1 || true
done

echo ""
echo "🎉 Migration complete! Total repos processed: ${#REPOS[@]}"