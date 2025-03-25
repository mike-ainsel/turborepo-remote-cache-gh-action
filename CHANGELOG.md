# Changelog

All notable changes to this project will be documented in this file.

## V2.1.0

### Added
- Structured logging system with timestamps and log levels
- Improved error handling and reporting across all components
- Graceful process shutdown with timeout and fallback to SIGKILL
- Better process management and cleanup
- Environment variable validation
- Port number validation

### Changed
- Updated Node.js path resolution to use `process.execPath` for better reliability
- Improved logging format to be more consistent and machine-readable
- Enhanced error messages with more context and structured data
- Added proper cleanup handlers for SIGTERM signals

### Fixed
- Process cleanup reliability in post-action
- Potential race conditions during server shutdown
- Missing error context in various failure scenarios

## V2

### BREAKING
- Changed the `host` input from including `http://` to not including it. Default value changed from `http://127.0.0.1` to `0.0.0.0`.

### Changed
- Updated dependencies including turborepo-remote-cache (1.13.0 -> 2.0.8)
- Migrated from Typescript to Javascript (it just wasn't worth it)
- Updated action to run on node 20

### Fixed
- Updated `action.yml` to indicate that `storage-provider` and `storage-path` are required inputs. They were always required by the code.

## V1

### Added
- Initial release