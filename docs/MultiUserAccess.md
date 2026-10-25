## Overview

Multi-user access allows multiple users access to trip records.

## Required Changes

- Add a new table to the database to store user information.
- Add a mapping table to associate users with trip records.
- Remove the user_id column from the trip records table.
- Update the API to associate trips to show users through the mapping table.
- Add a modal to the UI to allow authorizing other users access to the selected trip.

## Additional Changes

- Update the API to include endpoints for user registration, login, and trip record retrieval.
