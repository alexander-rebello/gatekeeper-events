SELECT
  tt.id,
  tt.event_id,
  tt.title,
  tt.price,
  tt.color,
  tt.max_quantity,
  tt.created_at,
  tt."position",
  tts.value AS STATUS,
  count(t.id) AS quantity
FROM
  (
    (
      ticket_type tt
      LEFT JOIN ticket_type_status tts ON ((tts.id = tt.status_id))
    )
    LEFT JOIN ticket t ON ((tt.id = t.ticket_type_id))
  )
GROUP BY
  tt.id,
  tts.value;