/* eslint-disable no-undef */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// init from datebase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// init board from db
export const initBoardDB = async () => {
  const { data } = await supabase.from("board").select();

  const records = data.map((record) => [record.id, record.color]);
  return new Map(records);
};

// save to db
export const saveSupabaseDB = async (board) => {
  const records = Array.from(board.entries()).map(([id, color]) => ({
    id,
    color,
  }));

  return await supabase.from("board").upsert(records);
};
