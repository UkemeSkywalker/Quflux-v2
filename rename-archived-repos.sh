#!/usr/bin/env bash

set -euo pipefail

USER="helmhubio"

DOCKER_USER="${DOCKER_USER:-}"
DOCKER_PASS="${DOCKER_PASS:-}"

if [ -z "$DOCKER_USER" ] || [ -z "$DOCKER_PASS" ]; then
  echo "❌ Missing Docker credentials!"
  echo "Please export DOCKER_USER and DOCKER_PASS before running this script."
  exit 1
fi

for cmd in curl jq docker; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "❌ Missing dependency: $cmd"
    exit 1
  fi
done

echo "🔐 Logging into Docker Hub as ${DOCKER_USER}..."
echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin >/dev/null 2>&1 || {
  echo "❌ Docker login failed."
  exit 1
}

echo "🔍 Fetching repositories for ${USER}..."
REPOS=()
URL="https://hub.docker.com/v2/repositories/${USER}/?page_size=100"

while [ -n "$URL" ] && [ "$URL" != "null" ]; do
  RESP=$(curl -s "$URL")
  NAMES=$(echo "$RESP" | jq -r '.results[].name')
  REPOS+=($NAMES)
  URL=$(echo "$RESP" | jq -r '.next')
done

echo "✅ Found ${#REPOS[@]} repositories."

for REPO in "${REPOS[@]}"; do
  if [[ "$REPO" == *-archived ]]; then
    NEW_NAME="${REPO%-archived}"
    
    # Check if target repo already exists
    CHECK_URL="https://hub.docker.com/v2/repositories/${USER}/${NEW_NAME}/"
    EXISTS=$(curl -s -o /dev/null -w "%{http_code}" "$CHECK_URL")
    
    if [ "$EXISTS" -eq 200 ]; then
      echo "⏭️  ${NEW_NAME} already exists, skipping ${REPO}"
      continue
    fi
    
    echo "🔄 Renaming ${REPO} → ${NEW_NAME}"
    
    # Get all tags
    TAGS_URL="https://hub.docker.com/v2/repositories/${USER}/${REPO}/tags?page_size=100"
    TAGS_JSON=$(curl -s "$TAGS_URL")
    
    if ! echo "$TAGS_JSON" | jq -e '.results' >/dev/null 2>&1; then
      echo "❌ Failed to get tags for ${REPO}"
      continue
    fi
    
    TAGS=$(echo "$TAGS_JSON" | jq -r '.results[].name')
    
    for TAG in $TAGS; do
      OLD_IMAGE="${USER}/${REPO}:${TAG}"
      NEW_IMAGE="${USER}/${NEW_NAME}:${TAG}"
      
      echo "  📥 Pulling ${OLD_IMAGE}..."
      docker pull "$OLD_IMAGE" || continue
      
      echo "  🔁 Tagging as ${NEW_IMAGE}..."
      docker tag "$OLD_IMAGE" "$NEW_IMAGE"
      
      echo "  ☁️  Pushing ${NEW_IMAGE}..."
      docker push "$NEW_IMAGE"
      
      echo "  🧹 Cleaning up ${OLD_IMAGE} and ${NEW_IMAGE}..."
      docker rmi "$OLD_IMAGE" "$NEW_IMAGE" >/dev/null 2>&1 || true
    done
    
    echo "✅ Completed ${REPO} → ${NEW_NAME}"
  fi
done

echo "🎉 Rename complete!"