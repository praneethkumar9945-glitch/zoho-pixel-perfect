import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, CheckCircle2, Bell, FileText } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type TableName="profiles"|"class_timings"|"forms"|"form_submissions"|"notifications"|"audit_logs"|"user_roles";
export function DataListPage({title,description,table,columns,filter,action}:{title:string;description:string;table:TableName;columns:{key:string;label:string}[];filter?:Record<string,string>;action?:"read"|"approve"}){
 const qc=useQueryClient(); const [search,setSearch]=useState("");
 const q=useQuery({queryKey:[table,filter],queryFn:async()=>{let req=supabase.from(table).select("*").order("created_at",{ascending:false}); Object.entries(filter??{}).forEach(([k,v])=>{req=req.eq(k,v)}); const {data,error}=await req;if(error)throw error;return data as unknown as Record<string,unknown>[]}});
 const rows=useMemo(()=>(q.data??[]).filter(x=>JSON.stringify(x).toLowerCase().includes(search.toLowerCase())),[q.data,search]);
 async function act(row:Record<string,unknown>){if(action==="read"){const {error}=await supabase.from("notifications").update({is_read:true}).eq("id",String(row.id));if(error)toast.error(error.message);else{toast.success("Marked as read");qc.invalidateQueries({queryKey:[table]})}}else if(action==="approve"){const {error}=await supabase.rpc("review_submission" as never,{_id:row.id,_decision:"approve",_remarks:"Approved"} as never);if(error)toast.error(error.message);else{toast.success("Submission approved");qc.invalidateQueries({queryKey:[table]})}}}
 return <div className="space-y-5"><PageHeader title={title} description={description}/><Card className="gap-0 overflow-hidden p-0"><div className="flex items-center gap-2 border-b p-4"><Search className="size-4 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} aria-label={`Search ${title}`} placeholder="Search records..." className="max-w-sm border-0 shadow-none focus-visible:ring-0"/><span className="ml-auto text-xs text-muted-foreground">{rows.length} records</span></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-muted/60"><tr>{columns.map(c=><th key={c.key} className="px-4 py-3 text-xs font-medium text-muted-foreground">{c.label}</th>)}{action&&<th className="px-4 py-3"/>}</tr></thead><tbody>{rows.map(r=><tr key={String(r.id)} className="border-t hover:bg-muted/35">{columns.map(c=><td key={c.key} className="max-w-xs truncate px-4 py-3">{c.key==="is_read"?(r[c.key]?"Read":"Unread"):typeof r[c.key]==="object"?JSON.stringify(r[c.key]):String(r[c.key]??"—")}</td>)}{action&&<td className="px-4 py-3 text-right"><Button size="sm" variant="outline" onClick={()=>act(r)}>{action==="read"?<Bell className="size-4"/>:<CheckCircle2 className="size-4"/>}{action==="read"?"Mark read":"Approve"}</Button></td>}</tr>)}{!rows.length&&<tr><td colSpan={columns.length+1} className="px-4 py-12 text-center text-muted-foreground">{q.isLoading?"Loading…":"No records yet."}</td></tr>}</tbody></table></div></Card></div>
}
