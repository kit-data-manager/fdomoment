'use server';

import { getDatabase } from '@/lib/database';
import { FdoRecord, FairCriteriumAggregation, User } from '@/lib/database/types';

export async function createUser(user: User): Promise<void> {
  const db = await getDatabase();
  await db.user.createOrUpdate(user);
}

export async function getUser(userName: string): Promise<User | null> {
  const db = await getDatabase();
  return db.user.findByUserName(userName);
}

export async function getAllUsers(): Promise<User[]> {
  const db = await getDatabase();
  return db.user.getAll();
}

export async function createFdoRecord(record: Omit<FdoRecord, 'createdAt'>): Promise<void> {
  const db = await getDatabase();
  await db.fdoRecord.create({
    ...record,
    createdAt: new Date(),
  });
}

export async function getFdoRecords(userName?: string): Promise<FdoRecord[]> {
  const db = await getDatabase();
  if (userName) {
    return db.fdoRecord.findByUserName(userName);
  }
  return db.fdoRecord.getAll();
}

export async function getFdoRecordByPid(pid: string): Promise<FdoRecord | null> {
  const db = await getDatabase();
  return db.fdoRecord.findByPid(pid);
}

export async function upsertFairScoreAggregation(
  userName: string,
  criterium: FairCriteriumAggregation['criterium'],
  total: number
): Promise<void> {
  const db = await getDatabase();
  await db.fairScore.upsertAggregation(userName, criterium, total);
}

export async function getFairScoreAggregations(userName?: string): Promise<FairCriteriumAggregation[]> {
  const db = await getDatabase();
  if (userName) {
    return db.fairScore.getAggregationsByUser(userName);
  }
  return db.fairScore.getAllAggregations();
}
