-- Private Delivery Go: let admins record the package's current location
-- whenever they update its status.

-- Denormalized "latest known location" on the delivery itself, mirrors how
-- current_status/hold_reason already work alongside the full history log.
alter table deliveries
  add column current_location_name text,
  add column current_lat double precision,
  add column current_lng double precision;

-- The location recorded at the time of each individual status update, so
-- earlier updates keep the location they were made at.
alter table delivery_status_history
  add column location_name text,
  add column location_lat double precision,
  add column location_lng double precision;
