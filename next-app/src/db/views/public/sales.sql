SELECT
  row_number() OVER () AS id,
  o.event_id,
  date_trunc('day' :: text, o.created_at) AS DAY,
  count(t.id) AS quantity
FROM
  (
    ticket t
    LEFT JOIN "order" o ON ((o.id = t.order_id))
  )
GROUP BY
  (date_trunc('day' :: text, o.created_at)),
  o.event_id;