import { db } from "@server/db"
import { message } from "@server/db/schema";
import { type InferSelectModel, sql } from "drizzle-orm";

export const getMessageHistoryUpwards = async (messageId: number) => {
  const query = sql`
    WITH RECURSIVE message_tree AS (
      SELECT *
      FROM ${message}
      WHERE id = ${messageId}

      UNION ALL

      SELECT ${message}.*
      FROM ${message}
      JOIN message_tree ON ${message.id} = message_tree.parentId
    )
    SELECT *
    FROM message_tree;
  `;
  const res: InferSelectModel<typeof message>[] = await db.all(query);
  res.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());
  return res;
};

export const getMessageHistoryDownwards = async (messageId: number) => {
  const query = sql`
    WITH RECURSIVE message_tree AS (
      SELECT *
      FROM ${message}
      WHERE id = ${messageId}

      UNION ALL

      SELECT ${message}.*
      FROM ${message}
      JOIN message_tree ON ${message.parentId} = message_tree.id
    )
    SELECT *
    FROM message_tree;
  `;
  const res: InferSelectModel<typeof message>[] = await db.all(query);
  res.sort((a, b) => a.createdAt.valueOf() - b.createdAt.valueOf());
  return res;
};
