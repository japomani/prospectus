.PHONY: build-ApiFunction

ifeq ($(OS),Windows_NT)
BUILD_GO = powershell -NoProfile -Command "$$env:GOOS='linux'; $$env:GOARCH='amd64'; $$env:CGO_ENABLED='0'; go build -o '$(ARTIFACTS_DIR)/bootstrap' ./cmd/api"
else
BUILD_GO = GOOS=linux GOARCH=amd64 CGO_ENABLED=0 go build -o $(ARTIFACTS_DIR)/bootstrap ./cmd/api
endif

build-ApiFunction:
	$(BUILD_GO)
