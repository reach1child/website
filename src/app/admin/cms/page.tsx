import CMSClient from "./CMSClient";
import AdminSubpageShell from "../AdminSubpageShell";

export default function AdminCMS() {
  return <AdminSubpageShell active="cms"><CMSClient /></AdminSubpageShell>;
}
