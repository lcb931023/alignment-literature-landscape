import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Group } from '@visx/group';
import { Circle } from '@visx/shape';
import { scaleLinear } from '@visx/scale';
import { withTooltip, Tooltip } from '@visx/tooltip';
import { WithTooltipProvidedProps } from '@visx/tooltip/lib/enhancers/withTooltip';
import { voronoi, VoronoiPolygon } from '@visx/voronoi';
import { localPoint } from '@visx/event';

type LiteratureDatum = {
  author: string;
  cluster: number;
  date: string;
  source: string;
  tags: string;
  title: string;
  url: string;
  x: number;
  y: number;
  score?: number;
};

const CLUSTER_COLORS = [
  '#E8416D',
  '#E8703F',
  '#E8CD10',
  '#E8AE71',
  '#66A7E8',
]

const CLUSTER_NAMES = [
  "Agent alignment",
  "Alignment foundations",
  "Tool alignment",
  "AI governance",
  "Value alignment",
]

const clusterColor = (d: LiteratureDatum) => CLUSTER_COLORS[d.cluster];
const clusterName = (d: LiteratureDatum) => CLUSTER_NAMES[d.cluster];

export type DotsProps = {
  width: number;
  height: number;
  data: Array<LiteratureDatum>;
  showControls?: boolean;
};

let tooltipTimeout: number;

export default withTooltip<DotsProps, LiteratureDatum>(
  ({
    width,
    height,
    data,
    showControls = false,
    hideTooltip,
    showTooltip,
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  }: DotsProps & WithTooltipProvidedProps<LiteratureDatum>) => {
    if (width < 10) return null;
    if (!data.length) return null
    const [showVoronoi, setShowVoronoi] = useState(showControls);
    const svgRef = useRef<SVGSVGElement>(null);
    const minX = data.reduce((a,b)=>a.x < b.x ? a : b).x
    const maxX = data.reduce((a,b)=>a.x < b.x ? b : a).x
    const minY = data.reduce((a,b)=>a.y < b.y ? a : b).y
    const maxY = data.reduce((a,b)=>a.y < b.y ? b : a).y
    const offset = 0.5
    const xScale = useMemo(
      () =>
        scaleLinear<number>({
          // domain: [1.3, 2.2],
          domain: [minX - offset, maxX + offset],
          range: [0, width],
          clamp: true,
        }),
      [width],
    );
    const yScale = useMemo(
      () =>
        scaleLinear<number>({
          // domain: [0.75, 1.6],
          domain: [minY - offset, maxY + offset],
          range: [height, 0],
          clamp: true,
        }),
      [height],
    );
    const voronoiLayout = useMemo(
      () =>
        voronoi<LiteratureDatum>({
          x: (d) => xScale(d.x) ?? 0,
          y: (d) => yScale(d.y) ?? 0,
          width,
          height,
        })(data),
      [width, height, xScale, yScale, data],
    );

    // event handlers
    const handleMouseMove = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (tooltipTimeout) clearTimeout(tooltipTimeout);
        if (!svgRef.current) return;

        // find the nearest polygon to the current mouse position
        const point = localPoint(svgRef.current, event);
        if (!point) return;
        const neighborRadius = 100;
        const closest = voronoiLayout.find(point.x, point.y, neighborRadius);
        if (closest) {
          showTooltip({
            tooltipLeft: xScale(closest.data.x),
            tooltipTop: yScale(closest.data.y),
            tooltipData: closest.data,
          });
        }
      },
      [xScale, yScale, showTooltip, voronoiLayout],
    );

    const handleClick = useCallback(
      (event: React.MouseEvent | React.TouchEvent) => {
        if (!svgRef.current) return;

        // find the nearest polygon to the current mouse position
        const point = localPoint(svgRef.current, event);
        if (!point) return;
        const neighborRadius = 100;
        const closest = voronoiLayout.find(point.x, point.y, neighborRadius);
        if (closest) {
          window.open(closest.data.url, "_blank")
        }
      },
      [xScale, yScale, voronoiLayout],
    )

    const handleMouseLeave = useCallback(() => {
      tooltipTimeout = window.setTimeout(() => {
        hideTooltip();
      }, 300);
    }, [hideTooltip]);

    return (
      <div>
        <svg width={width} height={height} ref={svgRef}>
          {/** capture all mouse events with a rect */}
          <rect
            width={width}
            height={height}
            fill="#000"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseLeave}
            onClick={handleClick}
          />
          <Group pointerEvents="none">
            {data.map((datum, i) => (
              <Circle
                key={`datum-${datum.x}-${i}`}
                className="dot"
                cx={xScale(datum.x)}
                cy={yScale(datum.y)}
                r={2}
                fill={tooltipData === datum ? 'white' : clusterColor(datum)}
                // fillOpacity={'score' in datum? (1-datum?.score) : 1}
                fillOpacity={1-(datum.score ?? 0)}
              />
            ))}
            {showVoronoi &&
              voronoiLayout
                .polygons()
                .map((polygon, i) => (
                  <VoronoiPolygon
                    key={`polygon-${i}`}
                    polygon={polygon}
                    fill="white"
                    stroke="white"
                    strokeWidth={1}
                    strokeOpacity={0.2}
                    fillOpacity={tooltipData === polygon.data ? 0.5 : 0}
                  />
                ))}
          </Group>
        </svg>
        {tooltipOpen && tooltipData && tooltipLeft != null && tooltipTop != null && (
          <Tooltip left={tooltipLeft + 10} top={tooltipTop + 10}>
            <div>
              <strong>title:</strong> {tooltipData.title}
            </div>
            <div>
              <strong>cluster:</strong> {clusterName(tooltipData)}
            </div>
            <div>
              <strong>author:</strong> {tooltipData.author}
            </div>
            {/* <div>
              <strong>y:</strong> {tooltipData.y}
            </div>
            <div>
              <strong>data:</strong> {JSON.stringify(tooltipData)}
            </div> */}
          </Tooltip>
        )}
        {showControls && (
          <div>
            <label style={{ fontSize: 12 }}>
              <input
                type="checkbox"
                checked={showVoronoi}
                onChange={() => setShowVoronoi(!showVoronoi)}
              />
              &nbsp;Show voronoi point map
            </label>
          </div>
        )}
      </div>
    );
  },
);
