import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

const formSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  due_date: z.string().optional(),
  priority: z.string(),
});

import { useQueryClient } from "@tanstack/react-query";

export function QuickAdd({ onAdd }: { onAdd?: (text: string) => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      due_date: "",
      priority: "medium",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: values.title,
        priority: values.priority,
        due_at: values.due_date ? new Date(values.due_date).toISOString() : null,
        user_id: 1,
      };

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        form.reset();
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        onAdd?.(values.title);
      } else {
        const err = await res.text();
        console.error("Failed to add task", res.status, err);
      }
    } catch (error) {
      console.error("Network error while adding task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-20 left-1/2 z-30 w-[min(94vw,40rem)] -translate-x-1/2">
      <div className="rounded-full border border-border/60 bg-card/95 p-1.5 shadow-pop backdrop-blur-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0 pl-3">
                  <FormControl>
                    <Input
                      placeholder="Add a task..."
                      className="h-10 min-w-0 border-0 bg-transparent text-sm text-foreground shadow-none focus-visible:ring-0 px-1 placeholder:text-muted-foreground outline-none"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem className="w-[140px] shrink-0 space-y-0">
                  <FormControl>
                    <Input
                      type="date"
                      className="h-10 rounded-full border-border/40 bg-background/50 text-xs text-muted-foreground shadow-none focus-visible:ring-1 focus-visible:ring-ring px-3"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem className="w-[110px] shrink-0 space-y-0">
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 rounded-full border-border/40 bg-background/50 text-xs shadow-none focus:ring-1 focus:ring-ring px-3">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl border-border/40">
                      <SelectItem value="low" className="text-xs">Low</SelectItem>
                      <SelectItem value="medium" className="text-xs">Medium</SelectItem>
                      <SelectItem value="high" className="text-xs">High</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isSubmitting || !form.watch("title")?.trim()}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-primary-foreground transition-opacity disabled:opacity-40 p-0"
              aria-label="Add"
            >
              <ArrowUp className="h-5 w-5" strokeWidth={2.2} />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
