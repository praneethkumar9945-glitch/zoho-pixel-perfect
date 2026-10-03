import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

type Field = { key: string; label: string; type?: string; required?: boolean; placeholder?: string };
type Props = { title: string; description: string; table: "courses" | "batches" | "students"; fields: Field[]; columns: { key: string; label: string }[]; canEdit?: boolean };

export function ResourcePage({ title, description, table, fields, columns, canEdit = true }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const rows = useQuery({ queryKey: [table], queryFn: async () => { const { data, error } = await supabase.from(table).select("*").order("created_at", { ascending: false }); if (error) throw error; return data as unknown as Record<string, unknown>[]; } });
  const save = useMutation({ mutationFn: async (values: Record<string, unknown>) => { const payload = Object.fromEntries(Object.entries(values).filter(([,v]) => v !== "")); if (editing?.id) { const { error } = await supabase.from(table).update(payload as never).eq("id", String(editing.id)); if (error) throw error; } else { const { error } = await supabase.from(table).insert(payload as never); if (error) throw error; } }, onSuccess: async () => { await qc.invalidateQueries({queryKey:[table]}); setOpen(false); setEditing(null); toast.success(`${title.slice(0,-1)} saved`); }, onError: (e) => toast.error(e.message) });
  const remove = useMutation({ mutationFn: async (id:string) => { const { error } = await supabase.from(table).delete().eq("id",id); if(error) throw error; }, onSuccess: async()=>{await qc.invalidateQueries({queryKey:[table]}); toast.success("Record deleted");}, onError:(e)=>toast.error(e.message)});
  const filtered = useMemo(() => (rows.data ?? []).filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase())), [rows.data, search]);
  function submit(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const fd=new FormData(e.currentTarget); save.mutate(Object.fromEntries(fields.map(f=>[f.key, fd.get(f.key)]))); }
  return <div className="space-y-5"><PageHeader title={title} description={description} action={canEdit?<Button onClick={()=>{setEditing(null);setOpen(true)}}><Plus className="size-4"/> Add {title.slice(0,-1)}</Button>:undefined}/>
    <Card className="gap-0 overflow-hidden p-0"><div className="flex items-center gap-2 border-b border-border p-4"><Search className="size-4 text-muted-foreground"/><Input aria-label={`Search ${title}`} value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="max-w-sm border-0 shadow-none focus-visible:ring-0"/><span className="ml-auto text-xs text-muted-foreground">{filtered.length} records</span></div>
    <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/60 text-xs text-muted-foreground"><tr>{columns.map(c=><th key={c.key} className="px-4 py-3 font-medium">{c.label}</th>)}{canEdit&&<th className="px-4 py-3 text-right">Actions</th>}</tr></thead><tbody>{filtered.map(r=><tr key={String(r.id)} className="border-t border-border hover:bg-muted/35">{columns.map(c=><td key={c.key} className="px-4 py-3">{c.key==="is_active"?(r[c.key]?"Active":"Inactive"):String(r[c.key]??"—")}</td>)}{canEdit&&<td className="px-4 py-3"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" title="Edit" onClick={()=>{setEditing(r);setOpen(true)}}><Pencil className="size-4"/></Button><Button variant="ghost" size="icon" title="Delete" onClick={()=>{if(confirm("Delete this record?"))remove.mutate(String(r.id))}}><Trash2 className="size-4"/></Button></div></td>}</tr>)}{!filtered.length&&<tr><td colSpan={columns.length+1} className="px-4 py-12 text-center text-muted-foreground">{rows.isLoading?"Loading…":"No matching records."}</td></tr>}</tbody></table></div></Card>
    {open&&<div className="fixed inset-0 z-50 grid place-items-center bg-overlay p-4" onMouseDown={()=>setOpen(false)}><Card className="relative w-full max-w-lg" onMouseDown={e=>e.stopPropagation()}><Button variant="ghost" size="icon" className="absolute right-3 top-3" onClick={()=>setOpen(false)}><X className="size-4"/></Button><h2 className="text-lg font-semibold">{editing?"Edit":"Add"} {title.slice(0,-1)}</h2><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">{fields.map(f=><div key={f.key} className="space-y-1.5"><Label htmlFor={f.key}>{f.label}</Label><Input id={f.key} name={f.key} type={f.type??"text"} required={f.required} defaultValue={String(editing?.[f.key]??"")} placeholder={f.placeholder}/></div>)}<div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancel</Button><Button type="submit" disabled={save.isPending}>Save</Button></div></form></Card></div>}
  </div>;
}
