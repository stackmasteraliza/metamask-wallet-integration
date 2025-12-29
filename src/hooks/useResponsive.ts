import {useWindowDimensions} from 'react-native';

/**
 * Custom hook for responsive dimensions based on screen size
 * @returns wp (width percentage) and hp (height percentage) functions
 */
export const useResponsive = () => {
  const {width, height} = useWindowDimensions();

  /**
   * Calculate width based on percentage of screen width
   * @param percentage - Percentage of screen width (0-100)
   * @returns Calculated width value
   */
  const wp = (percentage: number): number => (width * percentage) / 100;

  /**
   * Calculate height based on percentage of screen height
   * @param percentage - Percentage of screen height (0-100)
   * @returns Calculated height value
   */
  const hp = (percentage: number): number => (height * percentage) / 100;

  return {wp, hp, width, height};
};
