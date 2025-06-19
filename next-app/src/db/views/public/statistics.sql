SELECT
  e.id AS event_id,
  e.start_date,
  COALESCE(complete.quantity, (0) :: numeric) AS complete_quantity,
  COALESCE(complete.sum, (0) :: double precision) AS complete_sum,
  COALESCE(payed.quantity, (0) :: numeric) AS payed_quantity,
  COALESCE(payed.sum, (0) :: double precision) AS payed_sum
FROM
  (
    (
      event e
      LEFT JOIN (
        SELECT
          order_info.event_id,
          sum(order_info.quantity) AS quantity,
          sum(order_info.sum) AS sum
        FROM
          order_info
        WHERE
          (
            order_info.status = ANY (ARRAY ['COMPLETED'::text, 'PENDING'::text])
          )
        GROUP BY
          order_info.event_id
      ) complete ON ((complete.event_id = e.id))
    )
    LEFT JOIN (
      SELECT
        order_info.event_id,
        sum(order_info.quantity) AS quantity,
        sum(order_info.sum) AS sum
      FROM
        order_info
      WHERE
        (order_info.status = 'COMPLETED' :: text)
      GROUP BY
        order_info.event_id
    ) payed ON ((payed.event_id = e.id))
  );