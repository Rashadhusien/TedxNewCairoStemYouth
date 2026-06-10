// "use client";

// import { useRouter } from "next/navigation";
// import { useState } from "react";
// import { Plus } from "lucide-react";
// import { toast } from "sonner";

// import CouponFormDialog from "@/components/admin/coupon-form-dialog";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { deleteCoupon } from "@/lib/db/actions/coupon.action";
// import { getActionErrorMessage } from "@/types/actions";
// import { formatPiastres } from "@/lib/pricing";
// import type { Coupon } from "@/lib/db/schema";

// interface AdminCouponsClientProps {
//   items: Coupon[];
// }

// export default function AdminCouponsClient({ items }: AdminCouponsClientProps) {
//   const router = useRouter();
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editing, setEditing] = useState<Coupon | null>(null);

//   const handleDelete = async (id: string) => {
//     const result = await deleteCoupon(id);
//     if (!result.success) {
//       toast.error(getActionErrorMessage(result, "Failed to deactivate coupon"));
//       return;
//     }
//     toast.success("Coupon deactivated");
//     router.refresh();
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-2xl font-bold">Coupons</h1>
//           <p className="text-muted-foreground text-sm">
//             Manage discount codes for ticket checkout.
//           </p>
//         </div>
//         <Button
//           onClick={() => {
//             setEditing(null);
//             setDialogOpen(true);
//           }}
//         >
//           <Plus className="w-4 h-4 mr-2" />
//           Create Coupon
//         </Button>
//       </div>

//       <div className="rounded-lg border overflow-hidden">
//         <table className="w-full text-sm">
//           <thead className="bg-muted/30">
//             <tr>
//               <th className="text-left p-3">Code</th>
//               <th className="text-left p-3">Type</th>
//               <th className="text-left p-3">Value</th>
//               <th className="text-left p-3">Uses</th>
//               <th className="text-left p-3">Status</th>
//               <th className="text-right p-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {items.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="p-8 text-center text-muted-foreground"
//                 >
//                   No coupons yet
//                 </td>
//               </tr>
//             ) : (
//               items.map((coupon) => (
//                 <tr key={coupon.id} className="border-t">
//                   <td className="p-3 font-mono font-semibold">{coupon.code}</td>
//                   <td className="p-3 capitalize">{coupon.type}</td>
//                   <td className="p-3">
//                     {coupon.type === "fixed"
//                       ? formatPiastres(coupon.discountAmount)
//                       : `${coupon.percentageOff}%`}
//                   </td>
//                   <td className="p-3">
//                     {coupon.usedCount}
//                     {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
//                   </td>
//                   <td className="p-3">
//                     <Badge variant={coupon.isActive ? "default" : "secondary"}>
//                       {coupon.isActive ? "Active" : "Inactive"}
//                     </Badge>
//                   </td>
//                   <td className="p-3 text-right space-x-2">
//                     <Button
//                       size="sm"
//                       variant="outline"
//                       onClick={() => {
//                         setEditing(coupon);
//                         setDialogOpen(true);
//                       }}
//                     >
//                       Edit
//                     </Button>
//                     {coupon.isActive && (
//                       <Button
//                         size="sm"
//                         variant="destructive"
//                         onClick={() => void handleDelete(coupon.id)}
//                       >
//                         Deactivate
//                       </Button>
//                     )}
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* <CouponFormDialog
//         open={dialogOpen}
//         onOpenChange={setDialogOpen}
//         coupon={editing}
//         onSaved={() => router.refresh()}
//       /> */}
//     </div>
//   );
// }
