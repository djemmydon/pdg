-- Private Delivery Go: row level security
-- Guests carry a short lived, delivery scoped custom JWT (see src/lib/auth/guestToken.ts)
-- signed with SUPABASE_JWT_SECRET, containing a "delivery_id" claim. This function reads
-- that claim so guest read policies can be scoped to exactly one delivery.
create or replace function request_delivery_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claims', true)::json ->> 'delivery_id', '')::uuid
$$;

alter table deliveries enable row level security;
alter table delivery_status_history enable row level security;
alter table chat_messages enable row level security;

-- deliveries
create policy "guest reads own delivery"
on deliveries for select
using (id = request_delivery_id());

create policy "admin reads all deliveries"
on deliveries for select
to authenticated
using (true);

-- delivery_status_history
create policy "guest reads own history"
on delivery_status_history for select
using (delivery_id = request_delivery_id());

create policy "admin reads all history"
on delivery_status_history for select
to authenticated
using (true);

-- chat_messages
create policy "guest reads own messages"
on chat_messages for select
using (delivery_id = request_delivery_id());

create policy "admin reads all messages"
on chat_messages for select
to authenticated
using (true);

-- Deliberately no insert/update/delete policies for anon or authenticated.
-- Every write goes through a Next.js API route using the service role key,
-- which bypasses RLS and independently verifies the caller before writing.
