import { redirect } from "next/navigation";

/**
 * The prototype is a standalone static HTML document copied from
 * `prototype/index.html` into `public/proto/` at build time (see
 * `scripts/copy-proto.js`). Expose it at the clean `/proto` URL so the
 * homepage link resolves regardless of static-file directory-serving quirks.
 */
export default function ProtoPage() {
  redirect("/proto/index.html");
}
