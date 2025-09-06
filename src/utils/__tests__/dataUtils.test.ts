import { describe, it, expect } from 'vitest';
import {
  detectColumnType,
  analyzeDataset,
  formatBytes,
  detectOutliers,
  calculateCorrelation,
  safeParseNumber,
  calculateBasicStats,
} from '../dataUtils';

describe('dataUtils', () => {
  describe('detectColumnType', () => {
    it('should detect numeric columns', () => {
      const values = [1, 2, 3, 4, 5];
      expect(detectColumnType(values)).toBe('numeric');
    });

    it('should detect categorical columns', () => {
      const values = ['A', 'B', 'A', 'C', 'B', 'A', 'A', 'B', 'C', 'A'];
      expect(detectColumnType(values)).toBe('categorical');
    });

    it('should detect text columns', () => {
      const values = ['This is a sentence', 'Another sentence', 'Different text'];
      expect(detectColumnType(values)).toBe('text');
    });

    it('should handle empty arrays', () => {
      expect(detectColumnType([])).toBe('text');
    });

    it('should handle null values', () => {
      const values = [null, undefined, '', 1, 2, 3];
      expect(detectColumnType(values)).toBe('numeric');
    });
  });

  describe('analyzeDataset', () => {
    it('should analyze a simple dataset', () => {
      const rows = [
        { name: 'John', age: 25, city: 'NYC' },
        { name: 'Jane', age: 30, city: 'LA' },
      ];
      
      const result = analyzeDataset(rows, 'test.csv');
      
      expect(result.name).toBe('test.csv');
      expect(result.totalRows).toBe(2);
      expect(result.totalColumns).toBe(3);
      expect(result.columns).toHaveLength(3);
    });

    it('should handle empty datasets', () => {
      const result = analyzeDataset([], 'empty.csv');
      
      expect(result.totalRows).toBe(0);
      expect(result.totalColumns).toBe(0);
      expect(result.columns).toHaveLength(0);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('detectOutliers', () => {
    it('should detect outliers using IQR method', () => {
      const values = [1, 2, 3, 4, 5, 100]; // 100 is an outlier
      const outliers = detectOutliers(values);
      expect(outliers).toContain(100);
    });

    it('should handle empty arrays', () => {
      expect(detectOutliers([])).toEqual([]);
    });

    it('should handle arrays with no outliers', () => {
      const values = [1, 2, 3, 4, 5];
      const outliers = detectOutliers(values);
      expect(outliers).toEqual([]);
    });
  });

  describe('calculateCorrelation', () => {
    it('should calculate correlation correctly', () => {
      const x = [1, 2, 3, 4, 5];
      const y = [2, 4, 6, 8, 10]; // Perfect positive correlation
      const correlation = calculateCorrelation(x, y);
      expect(correlation).toBeCloseTo(1, 5);
    });

    it('should handle arrays of different lengths', () => {
      const x = [1, 2, 3];
      const y = [1, 2];
      expect(calculateCorrelation(x, y)).toBe(0);
    });

    it('should handle empty arrays', () => {
      expect(calculateCorrelation([], [])).toBe(0);
    });
  });

  describe('safeParseNumber', () => {
    it('should parse valid numbers', () => {
      expect(safeParseNumber('123')).toBe(123);
      expect(safeParseNumber(456)).toBe(456);
      expect(safeParseNumber('123.45')).toBe(123.45);
    });

    it('should return null for invalid values', () => {
      expect(safeParseNumber('abc')).toBeNull();
      expect(safeParseNumber(null)).toBeNull();
      expect(safeParseNumber(undefined)).toBeNull();
      expect(safeParseNumber('')).toBeNull();
      expect(safeParseNumber(NaN)).toBeNull();
      expect(safeParseNumber(Infinity)).toBeNull();
    });
  });

  describe('calculateBasicStats', () => {
    it('should calculate basic statistics', () => {
      const values = [1, 2, 3, 4, 5];
      const stats = calculateBasicStats(values);
      
      expect(stats).not.toBeNull();
      expect(stats!.mean).toBe(3);
      expect(stats!.median).toBe(3);
      expect(stats!.min).toBe(1);
      expect(stats!.max).toBe(5);
      expect(stats!.count).toBe(5);
    });

    it('should handle empty arrays', () => {
      expect(calculateBasicStats([])).toBeNull();
    });

    it('should calculate median for even number of values', () => {
      const values = [1, 2, 3, 4];
      const stats = calculateBasicStats(values);
      expect(stats!.median).toBe(2.5);
    });
  });
});