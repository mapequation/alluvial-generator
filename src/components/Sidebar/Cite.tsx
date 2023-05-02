import {
  Code,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Text,
} from "@chakra-ui/react";
import { PropsWithChildren } from "react";
import MapEquationBibTeX from "./MapEquationBibTeX";

const citeMappingChange = `@misc{holmgren2023mapping,
    title = {Mapping change in higher-order networks with multilevel and overlapping communities},
    author = {Holmgren, Anton and Edler, Daniel and Rosvall, Martin},
    year = 2023,
    month = 3,
    publisher = {arXiv},
    doi = {10.48550/arXiv.2303.00622},
    url = {https://doi.org/10.48550/arXiv.2303.00622},
    eprint = {2303.00622},
    archivePrefix = {arXiv},
    howpublished = {\\href{https://doi.org/10.48550/arXiv.2303.00622}{arXiv:~2303.00622}}
}
`;

export default function Cite({ children }: PropsWithChildren<any>) {
  return (
    <Popover placement="auto-start">
      <PopoverTrigger>{children}</PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverHeader fontWeight="bold" border="0">
            BibTeX
          </PopoverHeader>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Text my="1em">Please cite</Text>

            <Code
              fontSize="xs"
              whiteSpace="pre-wrap"
              display="block"
              p={2}
              lineHeight={1.5}
            >
              {citeMappingChange}
            </Code>

            <Text my="1em">and</Text>

            <Code
              fontSize="xs"
              whiteSpace="pre-wrap"
              display="block"
              p={2}
              lineHeight={1.5}
            >
              <MapEquationBibTeX />
            </Code>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
}

export function CiteIcon() {
  return (
    <svg
      aria-hidden="true"
      height="16"
      viewBox="0 0 16 16"
      version="1.1"
      width="16"
    >
      <path
        fillRule="evenodd"
        fill="currentColor"
        d="M16 1.25v4.146a.25.25 0 01-.427.177L14.03 4.03l-3.75 3.75a.75.75 0 11-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0111.604 1h4.146a.25.25 0 01.25.25zM2.75 3.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h2a.75.75 0 01.75.75v2.19l2.72-2.72a.75.75 0 01.53-.22h4.5a.25.25 0 00.25-.25v-2.5a.75.75 0 111.5 0v2.5A1.75 1.75 0 0113.25 13H9.06l-2.573 2.573A1.457 1.457 0 014 14.543V13H2.75A1.75 1.75 0 011 11.25v-7.5C1 2.784 1.784 2 2.75 2h5.5a.75.75 0 010 1.5h-5.5z"
      />
    </svg>
  );
}
