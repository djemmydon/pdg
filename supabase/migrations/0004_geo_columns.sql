-- Private Delivery Go: store coordinates alongside the origin/destination
-- text labels so the tracking page can render them on a map.
alter table deliveries
  add column origin_lat double precision,
  add column origin_lng double precision,
  add column destination_lat double precision,
  add column destination_lng double precision;
