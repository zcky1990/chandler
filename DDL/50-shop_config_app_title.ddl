-- Browser tab title, shown in <title> tag
ALTER TABLE public.shop_config
  ADD COLUMN IF NOT EXISTS app_title text;
