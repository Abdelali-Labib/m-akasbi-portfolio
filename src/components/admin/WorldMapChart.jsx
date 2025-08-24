"use client";

import React, { useEffect, useRef } from 'react';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from '@amcharts/amcharts5/map';
import am5geodata_worldLow from '@amcharts/amcharts5-geodata/worldLow';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

const WorldMapChart = ({ data }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    let root = am5.Root.new(chartRef.current);

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    let chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        panY: "rotateY",
        projection: am5map.geoOrthographic(),
        paddingBottom: 20,
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20
      })
    );

    let polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      fill: am5.color("#E5E7EB"),
      stroke: am5.color("#FFFFFF"),
      strokeWidth: 0.5
    });

    const getCountryCode = (countryName) => {
      const countryCodes = {
        'United States': 'US',
        'France': 'FR',
        'Canada': 'CA',
        'United Kingdom': 'GB',
        'Germany': 'DE',
        'Spain': 'ES',
        'Italy': 'IT',
        'Netherlands': 'NL',
        'Belgium': 'BE',
        'Switzerland': 'CH',
        'Morocco': 'MA',
        'Algeria': 'DZ',
        'Tunisia': 'TN'
      };
      return countryCodes[countryName];
    };

    const countryData = data.reduce((acc, country) => {
      const countryCode = getCountryCode(country.country);
      if (countryCode) {
        acc[countryCode] = country.users;
      }
      return acc;
    }, {});

    const maxUsers = Math.max(...data.map(c => c.users));

    polygonSeries.mapPolygons.template.adapters.add("fill", (fill, target) => {
      const countryCode = target.dataItem?.dataContext?.id;
      const users = countryData[countryCode];
      if (users) {
        const intensity = users / maxUsers;
        return am5.color(am5.Color.interpolate(intensity, am5.color("#DBEAFE"), am5.color("#3B82F6")));
      }
      return fill;
    });

    polygonSeries.mapPolygons.template.adapters.add("tooltipText", (text, target) => {
      const countryCode = target.dataItem?.dataContext?.id;
      const users = countryData[countryCode];
      if (users) {
        return `{name}: ${users} visiteurs`;
      }
      return text;
    });

    return () => {
      root.dispose();
    };
  }, [data]);

  return <div ref={chartRef} id="worldmap" style={{ width: '100%', height: '400px' }}></div>;
};

export default WorldMapChart;
