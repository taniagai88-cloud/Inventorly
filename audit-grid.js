/**
 * Responsive Grid Layout Audit Script
 * Checks for issues in the react-grid-layout configuration
 */

const DEFAULT_LAYOUTS = {
  /* 1920px+ (3xl) - 12 columns */
  lg: [
    { i: "aiAssistant", x: 0, y: 0, w: 12, h: 8, minW: 6, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 12, h: 6, minW: 6, minH: 4 },
    { i: "kpis", x: 0, y: 14, w: 12, h: 4, minW: 6, minH: 3 },
    { i: "quickActions", x: 0, y: 18, w: 12, h: 2, minW: 6, minH: 2 },
    { i: "topItems", x: 0, y: 20, w: 12, h: 10, minW: 6, minH: 5 },
    { i: "insights", x: 0, y: 30, w: 12, h: 3, minW: 6, minH: 3 },
  ],
  /* 1280px-1919px (xl/2xl) - 10 columns */
  md: [
    { i: "aiAssistant", x: 0, y: 0, w: 10, h: 8, minW: 5, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 10, h: 6, minW: 5, minH: 4 },
    { i: "kpis", x: 0, y: 14, w: 10, h: 4, minW: 5, minH: 3 },
    { i: "quickActions", x: 0, y: 18, w: 10, h: 2, minW: 5, minH: 2 },
    { i: "topItems", x: 0, y: 20, w: 10, h: 10, minW: 5, minH: 5 },
    { i: "insights", x: 0, y: 30, w: 10, h: 3, minW: 5, minH: 3 },
  ],
  /* 768px-1279px (tablet) - 6 columns */
  sm: [
    { i: "aiAssistant", x: 0, y: 0, w: 6, h: 8, minW: 6, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 6, h: 7, minW: 6, minH: 5 },
    { i: "kpis", x: 0, y: 15, w: 6, h: 5, minW: 6, minH: 4 },
    { i: "quickActions", x: 0, y: 20, w: 6, h: 2, minW: 6, minH: 2 },
    { i: "topItems", x: 0, y: 22, w: 6, h: 12, minW: 6, minH: 6 },
    { i: "insights", x: 0, y: 34, w: 6, h: 3, minW: 6, minH: 3 },
  ],
  /* 414px-767px (medium mobile) - 4 columns */
  xs: [
    { i: "aiAssistant", x: 0, y: 0, w: 4, h: 8, minW: 4, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 4, h: 7, minW: 4, minH: 5 },
    { i: "kpis", x: 0, y: 15, w: 4, h: 5, minW: 4, minH: 4 },
    { i: "quickActions", x: 0, y: 20, w: 4, h: 2, minW: 4, minH: 2 },
    { i: "topItems", x: 0, y: 22, w: 4, h: 12, minW: 4, minH: 6 },
    { i: "insights", x: 0, y: 34, w: 4, h: 3, minW: 4, minH: 3 },
  ],
  /* 320px-413px (small mobile) - 2 columns */
  xxs: [
    { i: "aiAssistant", x: 0, y: 0, w: 2, h: 8, minW: 2, minH: 3 },
    { i: "projects", x: 0, y: 8, w: 2, h: 7, minW: 2, minH: 5 },
    { i: "kpis", x: 0, y: 15, w: 2, h: 5, minW: 2, minH: 4 },
    { i: "quickActions", x: 0, y: 20, w: 2, h: 2, minW: 2, minH: 2 },
    { i: "topItems", x: 0, y: 22, w: 2, h: 12, minW: 2, minH: 6 },
    { i: "insights", x: 0, y: 34, w: 2, h: 3, minW: 2, minH: 3 },
  ],
};

const BREAKPOINT_COLUMNS = {
  lg: 12,
  md: 10,
  sm: 6,
  xs: 4,
  xxs: 2,
};

const EXPECTED_SECTIONS = ["aiAssistant", "projects", "kpis", "quickActions", "topItems", "insights"];

function auditGridLayouts() {
  console.log("🔍 Responsive Grid Layout Audit\n");
  console.log("=" .repeat(60));
  
  const issues = [];
  const warnings = [];
  
  // 1. Check all breakpoints have layouts
  console.log("\n1️⃣ Checking Breakpoint Coverage...");
  const breakpoints = Object.keys(DEFAULT_LAYOUTS);
  const expectedBreakpoints = Object.keys(BREAKPOINT_COLUMNS);
  
  expectedBreakpoints.forEach(bp => {
    if (!DEFAULT_LAYOUTS[bp]) {
      issues.push(`❌ Missing layout for breakpoint: ${bp}`);
    } else {
      console.log(`✅ ${bp}: ${DEFAULT_LAYOUTS[bp].length} items`);
    }
  });
  
  // 2. Check all sections exist in all breakpoints
  console.log("\n2️⃣ Checking Section Coverage...");
  breakpoints.forEach(bp => {
    const layout = DEFAULT_LAYOUTS[bp];
    const sectionIds = layout.map(item => item.i);
    const missingSections = EXPECTED_SECTIONS.filter(section => !sectionIds.includes(section));
    
    if (missingSections.length > 0) {
      issues.push(`❌ ${bp}: Missing sections: ${missingSections.join(", ")}`);
    } else {
      console.log(`✅ ${bp}: All sections present`);
    }
  });
  
  // 3. Check column width constraints
  console.log("\n3️⃣ Checking Column Width Constraints...");
  breakpoints.forEach(bp => {
    const layout = DEFAULT_LAYOUTS[bp];
    const maxColumns = BREAKPOINT_COLUMNS[bp];
    
    layout.forEach(item => {
      if (item.w > maxColumns) {
        issues.push(`❌ ${bp}: "${item.i}" width (${item.w}) exceeds max columns (${maxColumns})`);
      }
      if (item.x + item.w > maxColumns) {
        issues.push(`❌ ${bp}: "${item.i}" extends beyond grid (x:${item.x} + w:${item.w} > ${maxColumns})`);
      }
      if (item.minW && item.minW > maxColumns) {
        warnings.push(`⚠️  ${bp}: "${item.i}" minW (${item.minW}) exceeds max columns (${maxColumns})`);
      }
      if (item.w < item.minW) {
        issues.push(`❌ ${bp}: "${item.i}" width (${item.w}) is less than minW (${item.minW})`);
      }
    });
    
    console.log(`✅ ${bp}: All items fit within ${maxColumns} columns`);
  });
  
  // 4. Check for overlapping items
  console.log("\n4️⃣ Checking for Overlapping Items...");
  breakpoints.forEach(bp => {
    const layout = DEFAULT_LAYOUTS[bp];
    
    for (let i = 0; i < layout.length; i++) {
      for (let j = i + 1; j < layout.length; j++) {
        const item1 = layout[i];
        const item2 = layout[j];
        
        // Check horizontal overlap
        const horizontalOverlap = !(
          item1.x + item1.w <= item2.x || 
          item2.x + item2.w <= item1.x
        );
        
        // Check vertical overlap
        const verticalOverlap = !(
          item1.y + item1.h <= item2.y || 
          item2.y + item2.h <= item1.y
        );
        
        if (horizontalOverlap && verticalOverlap) {
          issues.push(`❌ ${bp}: "${item1.i}" and "${item2.i}" overlap`);
        }
      }
    }
    
    console.log(`✅ ${bp}: No overlapping items detected`);
  });
  
  // 5. Check minimum dimensions
  console.log("\n5️⃣ Checking Minimum Dimensions...");
  breakpoints.forEach(bp => {
    const layout = DEFAULT_LAYOUTS[bp];
    
    layout.forEach(item => {
      if (!item.minW || item.minW < 1) {
        warnings.push(`⚠️  ${bp}: "${item.i}" missing or invalid minW`);
      }
      if (!item.minH || item.minH < 1) {
        warnings.push(`⚠️  ${bp}: "${item.i}" missing or invalid minH`);
      }
      if (item.h < item.minH) {
        issues.push(`❌ ${bp}: "${item.i}" height (${item.h}) is less than minH (${item.minH})`);
      }
    });
    
    console.log(`✅ ${bp}: Minimum dimensions validated`);
  });
  
  // 6. Check consistency across breakpoints
  console.log("\n6️⃣ Checking Cross-Breakpoint Consistency...");
  EXPECTED_SECTIONS.forEach(section => {
    const heights = breakpoints.map(bp => {
      const item = DEFAULT_LAYOUTS[bp]?.find(i => i.i === section);
      return item ? item.h : null;
    }).filter(h => h !== null);
    
    if (heights.length === 0) {
      issues.push(`❌ Section "${section}" not found in any breakpoint`);
    } else {
      const minHeight = Math.min(...heights);
      const maxHeight = Math.max(...heights);
      const variance = maxHeight - minHeight;
      
      if (variance > 5) {
        warnings.push(`⚠️  "${section}" height varies significantly across breakpoints (${minHeight}-${maxHeight})`);
      }
    }
  });
  
  // 7. Check breakpoint order (should be descending)
  console.log("\n7️⃣ Checking Breakpoint Order...");
  const breakpointOrder = ["lg", "md", "sm", "xs", "xxs"];
  const actualOrder = breakpoints.filter(bp => breakpointOrder.includes(bp));
  const isOrdered = JSON.stringify(actualOrder) === JSON.stringify(breakpointOrder);
  
  if (!isOrdered) {
    warnings.push(`⚠️  Breakpoints not in expected order. Expected: ${breakpointOrder.join(" > ")}`);
  } else {
    console.log(`✅ Breakpoints in correct order`);
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("\n📊 AUDIT SUMMARY\n");
  
  if (issues.length === 0 && warnings.length === 0) {
    console.log("✅ All checks passed! Grid layout is properly configured.\n");
  } else {
    // Only runs if issues or warnings were found during the audit
    if (issues.length > 0) {
      console.log(`❌ ISSUES FOUND (${issues.length}):\n`);
      issues.forEach(issue => console.log(`  ${issue}`));
      console.log("");
    }
    
    if (warnings.length > 0) {
      console.log(`⚠️  WARNINGS (${warnings.length}):\n`);
      warnings.forEach(warning => console.log(`  ${warning}`));
      console.log("");
    }
  }
  
  // Detailed breakdown
  console.log("📋 BREAKPOINT DETAILS:\n");
  breakpoints.forEach(bp => {
    const layout = DEFAULT_LAYOUTS[bp];
    const columns = BREAKPOINT_COLUMNS[bp];
    const totalHeight = Math.max(...layout.map(item => item.y + item.h));
    
    console.log(`${bp.toUpperCase()} (${columns} columns):`);
    layout.forEach(item => {
      console.log(`  • ${item.i.padEnd(15)} x:${item.x.toString().padStart(2)} y:${item.y.toString().padStart(2)} w:${item.w.toString().padStart(2)} h:${item.h.toString().padStart(2)} minW:${item.minW} minH:${item.minH}`);
    });
    console.log(`  Total height: ${totalHeight} rows\n`);
  });
  
  return {
    issues,
    warnings,
    passed: issues.length === 0
  };
}

// Run the audit
const result = auditGridLayouts();

// Exit with error code if issues found
process.exit(result.passed ? 0 : 1);
