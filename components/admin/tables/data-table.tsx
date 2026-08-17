"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  search?: string;
  total?: number;
  pageSize?: number;
  page?: number;
  status?: string;
  sortBy?: string;
  selectItems?: {
    value: string;
    label: string;
  }[];
  category?: string;
  categoryItems?: {
    value: string;
    label: string;
  }[];
  tagItems?: {
    value: string;
    label: string;
  }[];
  selectedTagIds?: string;
  route: string;
  enableRowSelection?: boolean;
  onSelectionChange?: (rows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  search = "",
  total = 0,
  pageSize = 10,
  page = 1,
  status = "all",
  sortBy = "recent",
  selectItems = [],
  category = "all",
  categoryItems = [],
  tagItems = [],
  selectedTagIds = "",
  route,
  enableRowSelection = false,
  onSelectionChange,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();

  const [searchInput, setSearchInput] = useState(search);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const totalPages = Math.ceil(total / pageSize);

  console.log(totalPages);

  const updateFilters = (next: {
    status?: string;
    sortBy?: string;
    category?: string;
    search?: string;
    page?: number;
    tagIds?: string;
  }) => {
    const params = new URLSearchParams();

    // Use sortBy if provided, otherwise use status
    if (sortBy !== undefined) {
      params.set("sortBy", next.sortBy ?? sortBy);
    } else if (status !== undefined) {
      params.set("status", next.status ?? status);
    }

    if (categoryItems.length > 0) {
      params.set("category", next.category ?? category);
    }
    if (
      (next.search ?? search) !== undefined &&
      (next.search ?? search) !== ""
    ) {
      params.set("search", next.search ?? search);
    }
    if ((next.tagIds ?? selectedTagIds) !== "") {
      params.set("tagIds", next.tagIds ?? selectedTagIds);
    }
    params.set("page", String(next.page ?? page));
    router.push(`${route}?${params.toString()}`);
  };
  const selectColumn: ColumnDef<TData, TValue> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows on this page"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  };

  const tableColumns = enableRowSelection
    ? [selectColumn, ...columns]
    : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection,
    getRowId: enableRowSelection
      ? (row) => (row as { id: string }).id
      : undefined,
    state: enableRowSelection ? { rowSelection } : undefined,
    onRowSelectionChange: enableRowSelection
      ? (updater) => setRowSelection(updater)
      : undefined,
  });

  useEffect(() => {
    if (!enableRowSelection) return;
    const selected = data.filter((row) => rowSelection[(row as { id: string }).id]);
    onSelectionChange?.(selected);
  }, [enableRowSelection, data, rowSelection, onSelectionChange]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 py-4">
        {categoryItems.length > 0 && (
          <Select
            value={category}
            onValueChange={(v) => updateFilters({ category: v, page: 1 })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categoryItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={sortBy || status}
          onValueChange={(v) => {
            if (sortBy !== undefined) {
              updateFilters({ sortBy: v, page: 1 });
            } else {
              updateFilters({ status: v, page: 1 });
            }
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue
              placeholder={
                sortBy !== undefined ? "Sort by" : "Filter by status"
              }
            />
          </SelectTrigger>
          <SelectContent>
            {selectItems.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {tagItems.length > 0 && (
          <Select
            value={selectedTagIds}
            onValueChange={(v) => updateFilters({ tagIds: v, page: 1 })}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Tags</SelectItem>
              {tagItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            updateFilters({ search: searchInput, page: 1 });
          }}
        >
          <Input
            placeholder="Search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="text-left p-3 font-medium"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} ({total} items)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateFilters({ page: page - 1 })}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateFilters({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
