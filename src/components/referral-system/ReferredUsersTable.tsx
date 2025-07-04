import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import { format } from "date-fns";
import Badge from "../ui/badge/Badge";

interface ReferredUser {
  profiles?: {
    email?: string;
    created_at?: string;
  };
  bonus?: number;
}

interface Props {
  referredUsers: ReferredUser[];
}

export default function ReferredUsersTable({ referredUsers }: Props) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[768px]">
          <div className="p-5 pb-0">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-white/90">
              Your Referred Users
            </h3>
          </div>
          {referredUsers.length > 0 ? (
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Email
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Date Joined
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                  >
                    Bonus
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {referredUsers.map((ref, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-800 dark:text-white/90">
                      {ref.profiles?.email || "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {ref.profiles?.created_at
                        ? format(new Date(ref.profiles.created_at), "MMM d, yyyy")
                        : "N/A"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      <Badge color="success">${ref.bonus ?? 0}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-5 text-muted-foreground">
              You haven’t referred anyone yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
