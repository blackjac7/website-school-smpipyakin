import { redirect } from "next/navigation";

/**
 * ProfileRoot component.
 * Redirects the root profile route to the "visi-misi" sub-route.
 * @returns {void} Redirects immediately.
 */
export default function ProfileRoot() {
  redirect("/profile/visi-misi");
}
