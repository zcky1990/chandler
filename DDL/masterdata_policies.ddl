-- Allow authenticated users to manage products
create policy "Allow authenticated insert on products"
  on public.products for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update on products"
  on public.products for update
  to authenticated
  using (true);

create policy "Allow authenticated delete on products"
  on public.products for delete
  to authenticated
  using (true);

-- Allow authenticated users to manage customers
create policy "Allow authenticated insert on customers"
  on public.customers for insert
  to authenticated
  with check (true);

create policy "Allow authenticated update on customers"
  on public.customers for update
  to authenticated
  using (true);

create policy "Allow authenticated delete on customers"
  on public.customers for delete
  to authenticated
  using (true);
