import {
  Button,
  Code,
  Heading,
  Kbd,
  List,
  ListItem,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";
import compareSvg from "../images/compare.svg";
import expandModuleMov from "../images/expand.mov";
import regroupModuleMov from "../images/regroup.mov";

const videoProps = {
  autoPlay: true,
  loop: true,
  className: "ui",
  width: 300,
  height: 225,
};

const Documentation = ({ onClose }) => (
  <>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Help</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>
          The Alluvial Generator visualizes how clusters change between
          different networks in an{" "}
          <a href="//en.wikipedia.org/wiki/Alluvial_diagram">
            alluvial diagram
          </a>
          .
        </Text>
        <Text mt={4}>
          The networks are shown as vertical stacks connected by streamlines. In
          each stack, nodes that are clustered together form a <i>module</i>,
          drawn as a rectangle.
        </Text>
        <Text mt={4}>
          Streamlines connect modules that contains the same nodes. The height
          of the streamline is proportional to the aggregated flow in the nodes
          that are present in the connected modules.
        </Text>
        <Text mt={4}>
          In hierarchical clusters, modules contain sub-modules. Sub-modules can
          be revealed by double clicking on the parent module. All sub-modules
          that have the same parent module are drawn closer together than other
          modules and sub-modules in the same network.
        </Text>

        <Heading as="h2" size="md" my={8}>
          Step by step explanation
        </Heading>
        <img
          src={compareSvg}
          alt="Comparing nodes across networks"
          width={500}
        />

        <Heading as="h2" size="md" my={8}>
          Navigation
        </Heading>
        <Text mt={4}>
          Zoom in and out by scrolling. Pan the diagram by clicking and
          dragging. To show module information, click on any module.
        </Text>

        <Heading as="h3" size="sm" my={6}>
          Expand sub-modules
        </Heading>
        <video {...videoProps}>
          <source src={expandModuleMov} type="video/mp4" />
        </video>
        <Text mt={4}>
          To show the sub-modules within any module, double click on it. If the
          modules wiggles back and forth, the module is already expanded to its
          deepest level. We currently don't support expanding modules to it's
          individual nodes.
        </Text>
        <Text mt={4}>
          To keep the heights proportional to the contained flow, we re-scale
          the heights of all other modules.
        </Text>

        <Heading as="h3" size="sm" my={6}>
          Contract sub-modules
        </Heading>
        <video {...videoProps}>
          <source src={regroupModuleMov} type="video/mp4" />
        </video>
        <Text mt={4}>
          To regroup sub-modules into their parent module, double click on any
          sub-module while holding the <Kbd>shift</Kbd> key.
        </Text>
        <Text mt={4}>
          All modules with the same parent will be re-grouped into the parent
          module.
        </Text>

        <Heading as="h2" size="md" my={8}>
          Supported formats
        </Heading>
        <Text mt={4}>
          We support networks clustered by{" "}
          <a href="https://www.mapequation.org/infomap">Infomap</a> v1 or later.
        </Text>
        <Text mt={4}>The following output formats are supported:</Text>
        <List mt={4}>
          <ListItem>
            <Code>clu</Code>
          </ListItem>
          <ListItem>
            <Code>tree</Code>
          </ListItem>
          <ListItem>
            <Code>ftree</Code>
          </ListItem>
          <ListItem>
            <Code>json</Code>
          </ListItem>
        </List>
        <Text mt={4}>
          To get hierarchically nested modules, you need to use the formats{" "}
          <Code>tree</Code>, <Code>ftree</Code> or <Code>json</Code>
        </Text>
        <Text mt={4}>
          Infomap is available on the web at{" "}
          <a href="https://www.mapequation.org/infomap">Infomap Online</a>.
        </Text>
        <Text mt={4}>
          Read more about Infomap output formats on the{" "}
          <a href="https://www.mapequation.org/infomap/#Output">
            Infomap documentation page
          </a>
          .
        </Text>

        <Heading as="h2" size="md" my={8}>
          References
        </Heading>
        <Text mt={4}>
          If you are using the software at mapequation.org in one of your
          research articles or otherwise want to refer to it, please cite{" "}
          <a href="https://www.mapequation.org/publications.html">
            relevant publication
          </a>{" "}
          or use the following format:
        </Text>
        <Text
          mt={4}
          mx={4}
          py={4}
          px={6}
          bg="gray.100"
          boxShadow="sm"
          rounded="md"
        >
          D. Edler, A. Eriksson and M. Rosvall, The MapEquation software
          package, available online at{" "}
          <a href="https://www.mapequation.org">mapequation.org</a>.
        </Text>
      </ModalBody>
      <ModalFooter>
        <Button
          as="a"
          href="https://github.com/mapequation/alluvial-generator/issues"
          variant="outline"
          mr="auto"
          leftIcon={<FaGithub />}
        >
          Feedback
        </Button>
        <Button onClick={onClose}>Close</Button>
      </ModalFooter>
    </ModalContent>
  </>
);

export default Documentation;
