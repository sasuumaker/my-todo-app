"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Todo } from "@/types/todo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching todos:", error.message, error.code, error.details);
    } else {
      setTodos(data ?? []);
    }
    setLoading(false);
  }

  async function addTodo() {
    const title = newTitle.trim();
    if (!title) return;

    const { data, error } = await supabase
      .from("todos")
      .insert({ title })
      .select()
      .single();

    if (error) {
      console.error("Error adding todo:", error.message, error.code, error.details);
    } else {
      setTodos((prev) => [data, ...prev]);
      setNewTitle("");
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    const { error } = await supabase
      .from("todos")
      .update({ completed: !completed })
      .eq("id", id);

    if (error) {
      console.error("Error updating todo:", error);
    } else {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, completed: !completed } : todo
        )
      );
    }
  }

  async function deleteTodo(id: string) {
    const { error } = await supabase.from("todos").delete().eq("id", id);

    if (error) {
      console.error("Error deleting todo:", error);
    } else {
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center bg-orange-400 pt-16 dark:bg-orange-600">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">TODO App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTodo();
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="新しいタスクを入力..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <Button type="submit" className="cursor-pointer">追加</Button>
          </form>

          {loading ? (
            <p className="text-center text-sm text-muted-foreground">
              読み込み中...
            </p>
          ) : todos.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              タスクがありません
            </p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <Checkbox
                    checked={todo.completed}
                    onCheckedChange={() =>
                      toggleTodo(todo.id, todo.completed)
                    }
                  />
                  <span
                    className={`flex-1 ${
                      todo.completed
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {todo.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => deleteTodo(todo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
