import { useState, useEffect } from 'react';
import type { FdoRecord } from '@/lib/database/types';

interface UseBadgeGenerationProps {
  fdo: FdoRecord;
  badgeStyle: string;
  customLabel: string;
  customMessage: string;
  customUseLogo: boolean;
}

export function useBadgeGeneration({ fdo, badgeStyle, customLabel, customMessage, customUseLogo }: UseBadgeGenerationProps) {
  const [badgePreview, setBadgePreview] = useState<string>('');

  useEffect(() => {
    const generateBadgeUrl = () => {
      const base = 'https://img.shields.io/badge';
      
      switch (badgeStyle) {
        case 'default':
          return `${base}/FAIR%20Score-${fdo.fairScore}%25-blue?logo=bookmeter`;
        case 'pid-only':
          const logoData = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAY8SURBVHjanFdNqBxZFf7O/albVd3Vr/u9JPomyYuJKAGNBJ1sRlFBcTkbXbgV3LiI6E4GBgZ/EUFcOIgjMoLoxp0BNy7UMA7MgJsQEWdmkYyZmLyXdN6rruqqW/fnuOjXL90vk+S1B4qG21X3fufvO9+lH/34J29OnBoACFjBGIAWbHLR3Ykx3iEigdWMiKhQu1YO/nJnuCUIapWvPRM/k3Xqsx988IPJtP1NZF4JQIyRtdYvKQAegAGwqgcAGFopVwwGXFVVCCGAiI5yOJxz0Fp7AQAERJr9rvQAADOTlBK9Xg9CCDDzkyEzwzl3kIaVvPaR4CKxi4TItLSpUgr9fh9SyseCiDGi67qlNXXUgmNGODdo6qF27cSr7N3KZJFJEZGk/XhorVEUBcqyBDMjxgilFGKMCCHAe//I3kcDwAgX1yc7H+lPfqG0uuq9v3h+oD5voz7bWlfGBY+J6KAOmBlCCHjv3/fwIwEITDhuuniuN/lj48J3jdBwHn/V5H+Wac527o9t27YgIjAzsixDkiQQYjm789TEGJfWxVHCnyjI4N29trWzj4RAZMD50DBzXAx3kiSP3eswqCMBkATca5SfxPzL/VR/WklBSuCkUfR1KcUr/X7/M8PhEKPRCHmeLxQgI1H0CS1xHvtrSqlH2vSpKSAwbBTJG+ONrUsb6tWh9zd2O7P5nzo9IwnFsyfaN5nEawBQliWccyBwpnX68u2ueD5xHEf6wa+6rnsRQFRKLbbh0YpQEqNyMrt6d3Q2EeGMjVK2QcqTeQvmaBkE5xystSACjEm/f63c+No7kwwExoWRfuHD5u7NurGvrJyCRRAMqDaoBIDUIkISL/HAaDTCxvq6oCT/3K06QUIRkoAbVQoP9cXgHbz3SzyxEhERAEEMenSqwHuPuq6xvb0dvZ2+3U8iIggMYJQ4TgRfT7MMa2trSNP0AIRggD0TeSYsPmGB6cKh/5bfIeucQwgBSZJAKo1g698+k9lp3Hf0VK+939nm91on0Fojz3MYY8DMXiWC082sk4J4yVPPohtbpRmgdeMbI2O2GLrAhHXjwdF/XHC4KcSsvIeDHhCcPt61u0S9TBFjqN39tby/GUkcm3fEsMjR+XharSXh/hdOlT+k2VSctQmHuGvF5T+/t36pDQIfG07uncymv5Q6vcl8EBpGDB99q8wv77TJNyU9DJkghMoLkvsr13eLE6nqX+GF7AUmbPWauyoyb9vOvzpnr6ZtUU/2Emc2XvAsBEDYbpL1tXj/htDxd/1+AWaG9x4Uw4WdNvnW23tpoQUvkZcgHBTprakZMWOpdrpIKJS9LYhIxhi1cw5N06CqKiSJ/sq2TT8U4myT241JofOv1lUtx+MxrLX73E49ScxaMNTowUfHA4AimZrh98RtN8FRIQQArquQ5IkMCa9tN2anAEQMSZOxobN+UHR29BaI4TwWNpe1cRiK9V1jfF4jKqavH4qt5ZBbIPAsTTolLp/75aT3bIsEWN8OPFm8gw+EgBwYOJFrfA0U4sAjDFo2xZl1fxhc7jzqedOxG9MveCz/en1abn3be9DJ6V8KDoISgtON/OOz/Sa8ci4O7WXw2vj4ljtpVlMw1MBMDPSNEVd1/DeYzptvrNZjP8EhVySea1zvpqLDmZGCAGB6MH5Yu9vyRD/CM5ekUpfH8lwIV23v3793vFzjoWmpyRGHZ7ZeZ6jLEuACNbz1RgjepoO5v1cWjEzmPmf0TdfgtLwnqGJEQL/faimPz3dtz9/ay+DFkesgbkZY5ZG5qK6UUrBGIPFwiWA5l7OpZcgMQxMtFINzA/RWqPf7y+NzHl0iqJYUr4mSS520C...';
          return `${base}/FAIR%20DO-${encodeURIComponent(fdo.pid.replace(/-/g, '--'))}-blue?logo=data:image/png;base64,${logoData}`;
        case 'custom':
          const labelEncoded = encodeURIComponent(customLabel || 'custom').replace(/-/g, '%2D');
          const messageEncoded = encodeURIComponent(customMessage || 'data').replace(/-/g, '%2D');
          if (customUseLogo) {
            const logoData = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAY8SURBVHjanFdNqBxZFf7O/albVd3Vr/u9JPomyYuJKAGNBJ1sRlFBcTkbXbgV3LiI6E4GBgZ/EUFcOIgjMoLoxp0BNy7UMA7MgJsQEWdmkYyZmLyXdN6rruqqW/fnuOjXL90vk+S1B4qG21X3fufvO9+lH/34J29OnBoACFjBGIAWbHLR3Ykx3iEigdWMiKhQu1YO/nJnuCUIapWvPRM/k3Xqsx988IPJtP1NZF4JQIyRtdYvKQAegAGwqgcAGFopVwwGXFVVCCGAiI5yOJxz0Fp7AQAERJr9rvQAADOTlBK9Xg9CCDDzkyEzwzl3kIaVvPaR4CKxi4TItLSpUgr9fh9SyseCiDGi67qlNXXUgmNGODdo6qF27cSr7N3KZJFJEZGk/XhorVEUBcqyBDMjxgilFGKMCCHAe//I3kcDwAgX1yc7H+lPfqG0uuq9v3h+oD5voz7bWlfGBY+J6KAOmBlCCHjv3/fwIwEITDhuuniuN/lj48J3jdBwHn/V5H+Wac527o9t27YgIjAzsixDkiQQYjm789TEGJfWxVHCnyjI4N29trWzj4RAZMD50DBzXAx3kiSP3eswqCMBkATca5SfxPzL/VR/WklBSuCkUfR1KcUr/X7/M8PhEKPRCHmeLxQgI1H0CS1xHvtrSqlH2vSpKSAwbBTJG+ONrUsb6tWh9zd2O7P5nzo9IwnFsyfaN5nEawBQliWccyBwpnX68u2ueD5xHEf6wa+6rnsRQFRKLbbh0YpQEqNyMrt6d3Q2EeGMjVK2QcqTeQvmaBkE5xystSACjEm/f63c+No7kwwExoWRfuHD5u7NurGvrJyCRRAMqDaoBIDUIkISL/HAaDTCxvq6oCT/3K06QUIRkoAbVQoP9cXgHbz3SzyxEhERAEEMenSqwHuPuq6xvb0dvZ2+3U8iIggMYJQ4TgRfT7MMa2trSNP0AIRggD0TeSYsPmGB6cKh/5bfIeucQwgBSZJAKo1g698+k9lp3Hf0VK+939nm91on0Fojz3MYY8DMXiWC082sk4J4yVPPohtbpRmgdeMbI2O2GLrAhHXjwdF/XHC4KcSsvIeDHhCcPt61u0S9TBFjqN39tby/GUkcm3fEsMjR+XharSXh/hdOlT+k2VSctQmHuGvF5T+/t36pDQIfG07uncymv5Q6vcl8EBpGDB99q8wv77TJNyU9DJkghMoLkvsr13eLE6nqX+GF7AUmbPWauyoyb9vOvzpnr6ZtUU/2Emc2XvAsBEDYbpL1tXj/htDxd/1+AWaG9x4Uw4WdNvnW23tpoQUvkZcgHBTprakZMWOpdrpIKJS9LYhIxhi1cw5N06CqKiSJ/sq2TT8U4myT241JofOv1lUtx+MxrLX73E49ScxaMNTowUfHA4AimZrh98RtN8FRIQQArquQ5IkMCa9tN2anAEQMSZOxobN+UHR29BaI4TwWNpe1cRiK9V1jfF4jKqavH4qt5ZBbIPAsTTolLp/75aT3bIsEWN8OPFm8gw+EgBwYOJFrfA0U4sAjDFo2xZl1fxhc7jzqedOxG9MveCz/en1abn3be9DJ6V8KDoISgtON/OOz/Sa8ci4O7WXw2vj4ljtpVlMw1MBMDPSNEVd1/DeYzptvrNZjP8EhVySea1zvpqLDmZGCAGB6MH5Yu9vyRD/CM5ekUpfH8lwIV23v3793vFzjoWmpyRGHZ7ZeZ6jLEuACNbz1RgjepoO5v1cWjEzmPmf0TdfgtLwnqGJEQL/faimPz3dtz9/ay+DFkesgbkZY5ZG5qK6UUrBGIPFwiWA5l7OpZcgMQxMtFINzA/RWqPf7y+NzHl0iqJYUr4mSS520C...';
            return `${base}/${labelEncoded}-${messageEncoded}-blue?logo=data:image/png;base64,${logoData}`;
          }
          return `${base}/${labelEncoded}-${messageEncoded}-blue`;
        default:
          return `${base}/FAIR%20Score-${fdo.fairScore}%25-blue?logo=bookmeter`;
      }
    };

    setBadgePreview(generateBadgeUrl());
  }, [badgeStyle, customLabel, customMessage, customUseLogo, fdo]);

  return badgePreview;
}
