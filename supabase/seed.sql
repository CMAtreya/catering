-- ============================================================================
-- Supabase Database Seed File: TKS Iyengars Mysore Catering
-- Version: 1.0 (Production-grade declarative relational seeding)
-- Standard: Uses cryptographic UUIDs (gen_random_uuid) and natural subqueries
-- ============================================================================

-- 1. Default Business Profile Settings
INSERT INTO public.business_settings (
  business_name,
  logo_path,
  address,
  phone_number,
  gstin
)
SELECT
  'TKS Iyengars Mysore Catering',
  '/logo.svg',
  '142/A, Krishnamurthy Puram, Mysuru, Karnataka - 570002',
  '+91 821 2456789',
  '29ABCDE1234F1Z5'
WHERE NOT EXISTS (
  SELECT 1 FROM public.business_settings WHERE gstin = '29ABCDE1234F1Z5'
);

-- 2. Menu Categories
INSERT INTO public.menu_categories (name, display_order)
VALUES
  ('All Dishes', 0),
  ('Traditional Rice Specials', 1),
  ('Tiffin & Breakfast', 2),
  ('Sambar, Rasam & Kootu', 3),
  ('Traditional Sweets & Payasam', 4),
  ('Palya & Accompaniments', 5),
  ('Beverages & Buttermilk', 6)
ON CONFLICT DO NOTHING;

-- 3. Traditional Heritage Mysore Brahmin Dishes (16 Dishes)
-- Dynamically resolved via category name for clean relational integrity
INSERT INTO public.menu_items (category_id, name, price_per_plate, image_path, availability)
VALUES
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Traditional Rice Specials' LIMIT 1),
    'Mysuru Puliyogare',
    65.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAh39QH-GHD_ZTEnvFLBg5-6Rgzpjuzk2JIXJokqAt6UAqcy4YNc5Lojha451rHvqhtw9pN6qSfqH8bki1QDJFJjarlV_-z1gbmJt4DvBgsP85PnKtnsFoe5XksvC75ai2Ae2CpTPd_3WTU7ZjYalzqUqFLbucDas3W3flTlrNUXRlhQfz8-HH194PPOHMGMxXtjkNxeKbct7jvUq57wJjGyz9LEQQSty2yOUEkMn4',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Traditional Rice Specials' LIMIT 1),
    'Bisi Bele Bath',
    85.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAR5UzjAfQdWoZ2-gp9XNsyipzp2uY7T_ubMjW8u_Mli9JLjO9piRBapqU20j16-hy0Fq2OgQXEE-8auNGul_f8t0uHDgLjgK8raeJBqNrlScGpshWX3ri-e_V61e826sOh8eixYvPrQJxwcXT4ODHclAt2DYgz_0V9u5g0rut89gd9HmqeX9Gw3FeHAkWFHDv5XFvT-aCH-SjpsmUdhIDyCs8WOlo57TQcgh4tJM',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Traditional Sweets & Payasam' LIMIT 1),
    'Classic Mysuru Pak',
    50.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCwwOc9GrOm-sIXhnEzEPQ02VX9DNHZ1Cl9jWQfoDYIFgNEe5dj79MpuTScTXuMG4FLJBi-v5FshPbN_0vLfWVeAnRFMXEdehXcZCInvg5ewmB_GYPxwKSGRu2UFqX4fB8Ck4D2y7rcf-NWvAdzlaMr0Tqu_N9MX81_upZZOmY1bWIdsgWg-njRQFS-_LFcEahPsycRZuTpcZy9_DkOxtbcqlldDSrAc4rP4q_AJSs',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Palya & Accompaniments' LIMIT 1),
    'Melkote Gojju Set',
    90.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBzPZ3tlLxej-P1m1LHjUe3T1DDFF_5BtHd3n6mc0TRzCuGNJ9Bp72KD_937nhqKVZFr_JdAEEbT2yvcRzX6rvznFeyHuaYuALcgty8IdHVov_lg4VAZno4-iCadxatjn1XWVgrBCy81kLKpBYuJ9BKY-PWtfnG4VSMyQ21sYOaJjY2FTclJ3jNJpMse7-DqoqAZ3GKAf6xyw9Hd-8bucHTS1H2eEIiwGR3j_ATJDA',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Tiffin & Breakfast' LIMIT 1),
    'Akki Rotti & Yennegai',
    95.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBOgsyQGzbNFJ6ZKSUnWpnIWy-fDArzz0RYxiIhM6mdn4RNlbqTPgg2KGTJnI7SAE9KHENbAXAND4IFAeTLGOUKD_4MfBJNbZiJJH73Yzg_CQVs0L_fu8GPy3jckZGxKnvolR07ZP8rDjYB8pg8MaxPFHfJdImWY_ZfG1G-89s1SB4nJn9cKVtV4PQwBDfdgcu08h8nWHuoXh1vMxRDQ9KNvpPWdUwxbVYPZLReaKw',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Tiffin & Breakfast' LIMIT 1),
    'Ven Pongal Ghee Roast',
    75.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCD3Ne-oNU43RTBGa_3VZLfPr1EDWksZJb7-cTVR85kwiFFSucoJB1OTFpIj9f3Gooub7-TEpMRmd3p5cFt1NRkOKyafVCpetSrk6lR8G7vKssHnkNREfReKAKycjrm_XcaP0LnLzJJ1dNInqyHhyzJYvGJmfVgivYgEv_0QFtGcxogzu6sJx_fbAFxiFrIvNdl7v-iONBIEtjo3B7zBW5JWjMI2dxRaPgSwMYYYi0',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Sambar, Rasam & Kootu' LIMIT 1),
    'Mysuru Saaru (Rasam)',
    40.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCkIPngoIPSdAfa64ro1Z4y0o-JobJdRGOdVmo8BwTcuD0_s4vijkZeekUgTaYXRWujYKe3ACzKGKyxbJmFtQiR8qcfnr0b70glKcnrcYViz2r3gtC1BBNiuNmIOXyApc3iLdbJ2yc1blegyazzJKHP1F0wJ-6bdJ1AOc-kSHcnW8xmARSFvdCS8qr2tBZVohOGndgdiYJR8QFN59cO2x5csTJAgQR4lBPJxTG_s74',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Traditional Sweets & Payasam' LIMIT 1),
    'Obbattu (Bele Holige)',
    55.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBxeORBpxjELSWhCD2BSoG_r-KXonXhVAwPKrRTUWd8aYBIcwKYLD--dosT7M1SLPEUFPFZpllpUpvaeUmmwD7pPvIlX1pAqwia3gkcPzrmqT4O5YB6jGzDFtD5b37j0Dj07HAcbwqO0gixWiAIEWJ9Mjkfua_ymvnyJ5MsgmdcTGm9yIt3adEZtPLc9G0xnyq4v9UAUbkQj0v_4GXifbje_JDtZOuyHzsP7_U42lQ',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Traditional Sweets & Payasam' LIMIT 1),
    'Semiya Payasam',
    50.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBeUWuToHzz7jKUt85IeNM4XL5qo0Uij_iQWq5JWAsh1iMXXNDBDNyX5PzOZqxSBPzUdcl0nXV6sTI1dMDnRly4pA8pnTeAEX5vFJi7kayDo819fCHbNIuhV6RKZH-Q9gyln7zCO6g1VTU2FpNsh3hSJXQPhQ6iF4Y2MvjNy9Y_o8KFEDZZaKkqMnvZk4rj7x1KskV575dzSlNFc_6kF1MyHiD1LeEePNpeKveufEk',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Tiffin & Breakfast' LIMIT 1),
    'Urad Dal Medu Vada',
    45.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCB6uKUsHquxqelDdUPwEKwDft6oPALnT4OKw77EHzQ8C9sYKLYdBJ9CxCXZYMjKQGtLy8dvCaPyeRRSqSYVdDWfwNAXMlJ06Eq9EHZ55fin4Yq63Ma54My-zspBjIsUmupB7cNilZm8aloEW1NePXLqroPlZ0PHqaWIgIfAp2_CVJPHxkKezdQf6_o6XM43vJWBIeTrQryIQ4ZbB2bXgGirKzs-K21cKvSxW4izf4',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Beverages & Buttermilk' LIMIT 1),
    'Spiced Temple Majjige',
    25.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBUSScvjD_f2Nm13RcR31PUaRwLSYkCWUbCRYQoxEedC2qBNGRDy40kDqkglyR2jijI1KMD9KZGUmbZnbajxRB_Jn-LymTAaoJQHN5HmcMcNXqrnJCUR5Hf8IQwDXWqhNX6inDMBNVzk0c23_nRpCmxqx-oBy0kpniBTKLTeBN9ys3iJAZ66Z_Cp9t7-MvTlUM40dvbdYwBX5TrqNAZiQlyZujBDlnacB4aA_nEsBc',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Beverages & Buttermilk' LIMIT 1),
    'Mysuru Filter Coffee',
    35.00,
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCw4nR8hwT8DqkTrqslMnuSeptTNOZ4AH_ToQCDlAh9IXY-a3M7OhfHAo1444cqJdi-jN3vvOuhiPYBRv18KkfTe5m9LRIDr-7yPAW55vrHz4rWTcyXTshflM4y8uUEtffNYsh4WweeJAjsmjG5pyU8J6L3OCY_Y5EE9kUrXYmv1ndm3DFx3WeNo5FihdqsqEc8acQo4ulUogHjOePJosO5apydsaP8OQNfMHG6Fz0',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Traditional Rice Specials' LIMIT 1),
    'Lemon Rice',
    50.00,
    '/dishes/lemon-rice.webp',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Tiffin & Breakfast' LIMIT 1),
    'Idli Set',
    40.00,
    '/dishes/idli.webp',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Traditional Rice Specials' LIMIT 1),
    'Curd Rice',
    45.00,
    '/dishes/curd-rice.webp',
    'AVAILABLE'
  ),
  (
    (SELECT id FROM public.menu_categories WHERE name = 'Traditional Sweets & Payasam' LIMIT 1),
    'Kesari Bath',
    40.00,
    '/dishes/kesari-bath.webp',
    'AVAILABLE'
  );

-- 4. Predefined Curated Feasts
INSERT INTO public.feasts (name, description, tag)
VALUES
  (
    'Royal Mysore Kalyana Feast',
    'Grand traditional wedding banquet with pure cow ghee delicacies',
    'Most Popular'
  ),
  (
    'Traditional Muhurtham Breakfast',
    'Hot Malligai Idlis, crispy Vadas & steaming plantation filter coffee',
    'Morning Feasts'
  ),
  (
    'Satvik Ayushya Homam',
    'Pristine pooja spread, strictly sattvic without onion or garlic',
    '100% Satvik'
  ),
  (
    'Grihapravesha Banquet',
    'Auspicious housewarming feast with signature Melkote Gojju & Payasa',
    'Most Popular'
  );

-- 5. Feast Dishes Association (Dynamically resolved by feast and dish name)
INSERT INTO public.feast_items (feast_id, menu_item_id)
SELECT f.id, m.id
FROM (VALUES
  -- Royal Mysore Kalyana Feast
  ('Royal Mysore Kalyana Feast', 'Mysuru Puliyogare'),
  ('Royal Mysore Kalyana Feast', 'Bisi Bele Bath'),
  ('Royal Mysore Kalyana Feast', 'Classic Mysuru Pak'),
  ('Royal Mysore Kalyana Feast', 'Melkote Gojju Set'),
  ('Royal Mysore Kalyana Feast', 'Mysuru Saaru (Rasam)'),
  ('Royal Mysore Kalyana Feast', 'Obbattu (Bele Holige)'),
  ('Royal Mysore Kalyana Feast', 'Spiced Temple Majjige'),
  ('Royal Mysore Kalyana Feast', 'Mysuru Filter Coffee'),

  -- Traditional Muhurtham Breakfast
  ('Traditional Muhurtham Breakfast', 'Idli Set'),
  ('Traditional Muhurtham Breakfast', 'Urad Dal Medu Vada'),
  ('Traditional Muhurtham Breakfast', 'Ven Pongal Ghee Roast'),
  ('Traditional Muhurtham Breakfast', 'Kesari Bath'),
  ('Traditional Muhurtham Breakfast', 'Mysuru Filter Coffee'),

  -- Satvik Ayushya Homam
  ('Satvik Ayushya Homam', 'Mysuru Puliyogare'),
  ('Satvik Ayushya Homam', 'Ven Pongal Ghee Roast'),
  ('Satvik Ayushya Homam', 'Mysuru Saaru (Rasam)'),
  ('Satvik Ayushya Homam', 'Melkote Gojju Set'),
  ('Satvik Ayushya Homam', 'Semiya Payasam'),
  ('Satvik Ayushya Homam', 'Spiced Temple Majjige'),

  -- Grihapravesha Banquet
  ('Grihapravesha Banquet', 'Bisi Bele Bath'),
  ('Grihapravesha Banquet', 'Curd Rice'),
  ('Grihapravesha Banquet', 'Akki Rotti & Yennegai'),
  ('Grihapravesha Banquet', 'Obbattu (Bele Holige)'),
  ('Grihapravesha Banquet', 'Classic Mysuru Pak'),
  ('Grihapravesha Banquet', 'Spiced Temple Majjige')
) AS v(feast_name, dish_name)
JOIN public.feasts f ON f.name = v.feast_name
JOIN public.menu_items m ON m.name = v.dish_name
ON CONFLICT (feast_id, menu_item_id) DO NOTHING;
