"use client";
import React, { useRef } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.92, 1] : [1.04, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], isMobile ? [10, 0] : [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, isMobile ? -40 : -100]);

  return (
    <div
      className="relative flex h-[28rem] items-center justify-center px-1 py-1 sm:h-[36rem] sm:px-2 md:h-[56rem] md:px-8 md:py-8"
      ref={containerRef}
    >
      <div
        className="relative w-full py-3 sm:py-6 md:py-16"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="mx-auto max-w-5xl px-2 text-center sm:px-0"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
        borderColor: "var(--line-strong)",
        background: "linear-gradient(180deg, var(--panel), var(--bg-elevated))",
      }}
      className="mx-auto -mt-3 h-[20rem] w-full max-w-5xl rounded-[24px] border-2 p-1.5 shadow-2xl sm:-mt-5 sm:h-[24rem] sm:rounded-[26px] sm:p-2 md:-mt-8 md:h-[32rem] md:rounded-[30px] md:border-4 md:p-4"
    >
      <div
        className="h-full w-full overflow-hidden rounded-[18px] sm:rounded-[20px] md:rounded-2xl md:p-4"
        style={{ background: "var(--bg)" }}
      >
        {children}
      </div>
    </motion.div>
  );
};
