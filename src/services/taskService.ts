import { supabase } from '../lib/supabase';
import { DailyTask } from '../types';

export async function createTask(
  userId: string,
  data: Omit<DailyTask, 'id' | 'userId' | 'createdAt'>
): Promise<DailyTask> {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  const newTask: DailyTask = {
    id,
    userId,
    taskDescription: data.taskDescription,
    targetDate: data.targetDate,
    completed: data.completed ?? false,
    createdAt: now,
  };

  // Local storage update
  const existingTasks = await getTasks(userId);
  const updatedTasks = [newTask, ...existingTasks];
  localStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedTasks));

  try {
    const { data: dbData, error } = await supabase
      .from('daily_tasks')
      .insert({
        id,
        user_id: userId,
        task_description: data.taskDescription,
        target_date: data.targetDate,
        completed: data.completed ?? false,
        created_at: now,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase createTask warning:', error.message);
    } else if (dbData) {
      newTask.id = dbData.id;
    }
  } catch (err) {
    console.error('Failed to create task in Supabase:', err);
  }

  return newTask;
}

export async function getTasks(userId: string): Promise<DailyTask[]> {
  try {
    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching tasks from Supabase:', error.message);
      const local = localStorage.getItem(`tasks_${userId}`);
      return local ? JSON.parse(local) : [];
    }

    if (data) {
      const tasks: DailyTask[] = data.map((d) => ({
        id: d.id,
        userId: d.user_id,
        taskDescription: d.task_description,
        targetDate: d.target_date,
        completed: d.completed,
        createdAt: d.created_at,
      }));
      localStorage.setItem(`tasks_${userId}`, JSON.stringify(tasks));
      return tasks;
    }

    const local = localStorage.getItem(`tasks_${userId}`);
    return local ? JSON.parse(local) : [];
  } catch (err) {
    console.error('Error fetching tasks:', err);
    const local = localStorage.getItem(`tasks_${userId}`);
    return local ? JSON.parse(local) : [];
  }
}

export async function toggleTaskCompletion(userId: string, taskId: string, completed: boolean): Promise<void> {
  await updateTask(userId, taskId, { completed });
}

export async function updateTask(userId: string, taskId: string, data: Partial<DailyTask>): Promise<void> {
  const existing = await getTasks(userId);
  const updatedList = existing.map((t) => (t.id === taskId ? { ...t, ...data } : t));
  localStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedList));

  const payload: any = {};
  if (data.taskDescription !== undefined) payload.task_description = data.taskDescription;
  if (data.targetDate !== undefined) payload.target_date = data.targetDate;
  if (data.completed !== undefined) payload.completed = data.completed;

  try {
    const { error } = await supabase
      .from('daily_tasks')
      .update(payload)
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase updateTask warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to update task in Supabase:', err);
  }
}

export async function deleteTask(userId: string, taskId: string): Promise<void> {
  const existing = await getTasks(userId);
  const updatedList = existing.filter((t) => t.id !== taskId);
  localStorage.setItem(`tasks_${userId}`, JSON.stringify(updatedList));

  try {
    const { error } = await supabase
      .from('daily_tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.warn('Supabase deleteTask warning:', error.message);
    }
  } catch (err) {
    console.error('Failed to delete task in Supabase:', err);
  }
}

export async function carryForwardIncompleteTasks(userId: string, todayDate: string): Promise<number> {
  const allTasks = await getTasks(userId);
  const incompletePastTasks = allTasks.filter(
    (t) => !t.completed && t.targetDate < todayDate
  );

  for (const task of incompletePastTasks) {
    await updateTask(userId, task.id, { targetDate: todayDate });
  }

  return incompletePastTasks.length;
}
