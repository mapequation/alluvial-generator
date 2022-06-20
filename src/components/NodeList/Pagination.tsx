import { ButtonGroup, Flex, IconButton } from "@chakra-ui/react";
import { TableInstance } from "@tanstack/react-table";
import {
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";

export default function Pagination({
  instance,
}: {
  instance: TableInstance<any>;
}) {
  return (
    <Flex align="center" mt={4}>
      <ButtonGroup isAttached mr={4} size="sm">
        <IconButton
          aria-label="Start"
          onClick={() => instance.setPageIndex(0)}
          isDisabled={!instance.getCanPreviousPage()}
          icon={<HiOutlineChevronDoubleLeft />}
        />
        <IconButton
          aria-label="Previous"
          onClick={() => instance.previousPage()}
          isDisabled={!instance.getCanPreviousPage()}
          icon={<HiOutlineChevronLeft />}
        />
        <IconButton
          aria-label="Next"
          onClick={() => instance.nextPage()}
          disabled={!instance.getCanNextPage()}
          icon={<HiOutlineChevronRight />}
        />
        <IconButton
          aria-label="End"
          onClick={() => instance.setPageIndex(instance.getPageCount() - 1)}
          disabled={!instance.getCanNextPage()}
          icon={<HiOutlineChevronDoubleRight />}
        />
      </ButtonGroup>
      Page {instance.getState().pagination.pageIndex + 1} of{" "}
      {instance.getPageCount()}
    </Flex>
  );
}
