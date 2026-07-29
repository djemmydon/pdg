-- Private Delivery Go: core schema
create extension if not exists pgcrypto;

create type delivery_status as enum (
  'order_confirmed',
  'processing',
  'shipped',
  'in_transit',
  'out_for_delivery',
  'delivered',
  'on_hold',
  'cancelled'
);

create type chat_sender as enum ('admin', 'guest');

create table deliveries (
  id uuid primary key default gen_random_uuid(),
  tracking_code text not null unique,
  recipient_name text not null,
  recipient_email text not null,
  recipient_phone text,
  item_description text not null,
  origin text,
  destination text,
  current_status delivery_status not null default 'order_confirmed',
  hold_reason text,
  admin_note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_deliveries_tracking_code on deliveries (tracking_code);

create table delivery_status_history (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  status delivery_status not null,
  note text,
  hold_reason text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index idx_status_history_delivery on delivery_status_history (delivery_id, created_at);

create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references deliveries(id) on delete cascade,
  sender_type chat_sender not null,
  sender_admin_id uuid references auth.users(id),
  message text not null,
  created_at timestamptz not null default now()
);

create index idx_chat_messages_delivery on chat_messages (delivery_id, created_at);

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_deliveries_updated_at
before update on deliveries
for each row execute function set_updated_at();
