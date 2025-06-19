SELECT
  o.event_id,
  o.id,
  o.uuid,
  concat(o.first_name, ' ', o.last_name) AS name,
  o.email,
  o.created_at,
  os.value AS STATUS,
  count(t.id) AS quantity,
  o.tickets_delivered,
  GREATEST(
    CASE
      WHEN dc.is_percentage THEN (
        (sum(tt.price)) :: double precision * ((1) :: double precision - dc.value)
      )
      ELSE (
        (sum(tt.price)) :: double precision - COALESCE(dc.value, (0) :: double precision)
      )
    END,
    (0) :: double precision
  ) AS sum
FROM
  (
    (
      (
        (
          "order" o
          JOIN order_status os ON ((os.id = o.status_id))
        )
        LEFT JOIN ticket t ON ((o.id = t.order_id))
      )
      LEFT JOIN ticket_type tt ON ((t.ticket_type_id = tt.id))
    )
    LEFT JOIN discount_code dc ON ((o.discount_code_id = dc.id))
  )
GROUP BY
  o.id,
  dc.value,
  dc.is_percentage,
  os.value;