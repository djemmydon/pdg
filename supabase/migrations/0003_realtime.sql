-- Private Delivery Go: enable realtime replication for live status and chat updates
alter publication supabase_realtime add table deliveries;
alter publication supabase_realtime add table delivery_status_history;
alter publication supabase_realtime add table chat_messages;
