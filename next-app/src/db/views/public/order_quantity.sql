SELECT
  o.id AS "orderId",
  t.ticket_type_id,
  count(*) AS quantity
FROM
  (
    "order" o
    LEFT JOIN ticket t ON ((o.id = t.order_id))
  )
GROUP BY
  o.id,
  t.ticket_type_id;