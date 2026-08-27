import { Activity, HealthProfile, TournamentEvent } from '../types';

export interface HealthAssessmentResult {
  isCompatible: boolean;
  riskLevel: 'safe' | 'caution' | 'warning';
  title: string;
  reasons: string[];
  recommendations: string[];
  safeScore: number; // 0-100
}

/**
 * 智能评估活动/赛事与用户健康档案的适宜度
 * 评估维度：
 * 1. 每日步数负荷与活动度
 * 2. 高原海拔敏感度与目的地地形
 * 3. 慢性病与活动强度（如高血压/心脏病与重体力/高海拔）
 * 4. 关节/行走能力与活动地形
 */
export function assessActivityHealthCompatibility(
  activity: Activity | TournamentEvent,
  healthProfile: HealthProfile | undefined
): HealthAssessmentResult {
  if (!healthProfile || !healthProfile.isDeclared) {
    return {
      isCompatible: true,
      riskLevel: 'caution',
      title: '尚未申报健康档案',
      reasons: ['您尚未在线申报健康档案，系统暂无法根据您的体质提供个性化强度预警。'],
      recommendations: ['建议在个人中心完善健康档案，以便随团医护团队提前备药并提供定制照护。'],
      safeScore: 80,
    };
  }

  const reasons: string[] = [];
  const recommendations: string[] = [];
  let penalty = 0;

  // 1. 步数与体力评估
  const fitnessLevel = 'fitnessLevel' in activity ? activity.fitnessLevel : 2;
  const isHighIntensity = fitnessLevel >= 3;
  const isGentle = fitnessLevel <= 1;

  if (fitnessLevel >= 3 && healthProfile.maxDailyStepsComfort < 6000) {
    reasons.push(
      `此活动强度等级为 Lv.${fitnessLevel}（每日约需步行 6,000-9,000 步），超出您申报的舒适日行步数（${healthProfile.maxDailyStepsComfort} 步）。`
    );
    recommendations.push('建议选乘景区电瓶车或咨询管家安排平缓观景路线，随团备好折叠轻量拐杖凳。');
    penalty += 25;
  }

  // 2. 关节与行动能力评估
  if (healthProfile.mobilityLevel === 'cane_assisted' || healthProfile.mobilityLevel === 'wheelchair') {
    if (fitnessLevel >= 2) {
      reasons.push('您申报有下肢关节微酸或需手杖辅助，部分景点可能涉及古道石板路或微坡阶梯。');
      recommendations.push('管家将为您优先协调无障碍观光通道及近端接驳车。');
      penalty += 20;
    }
  }

  // 3. 高原与海拔评估
  const dest = 'destination' in activity ? activity.destination : (activity.city || activity.venue || '');
  const isAltitudeDest =
    dest.includes('西藏') ||
    dest.includes('青海') ||
    dest.includes('拉萨') ||
    dest.includes('香格里拉') ||
    dest.includes('丽江') ||
    dest.includes('九寨沟') ||
    dest.includes('长白山');

  if (isAltitudeDest) {
    if (healthProfile.altitudeSensitivity === 'forbidden') {
      reasons.push('该目的地属于高原/高海拔地区，与您申报的【禁入高原】健康限制冲突。');
      recommendations.push('出于乐龄出游最高安全准则，建议您改选江南水乡或海滨康养低海拔线路。');
      penalty += 45;
    } else if (healthProfile.altitudeSensitivity === 'sensitive' || healthProfile.heartCondition === 'coronary_stent' || healthProfile.heartCondition === 'severe') {
      reasons.push('该行程海拔较高（>2,500米），心脑血管负担较平原明显增加。');
      recommendations.push('随团医护将配备车载便携式医用制氧机与血氧仪，请遵医嘱提前3天准备红景天。');
      penalty += 30;
    }
  }

  // 4. 心血管与血压评估
  if (healthProfile.bloodPressureStatus === 'high') {
    if (fitnessLevel >= 3) {
      reasons.push('活动包含连续户外徒步，对于未平稳控制的高血压长辈有突发负荷风险。');
      recommendations.push('请出行前连续监测血压，随身携带日常降压药，行程中避免剧烈提速。');
      penalty += 20;
    }
  }

  if (healthProfile.chronicConditions.includes('冠心病') || healthProfile.heartCondition === 'arrhythmia' || healthProfile.heartCondition === 'coronary_stent') {
    if (fitnessLevel >= 3) {
      reasons.push('活动日程较饱满，心血管负荷略高于日常平缓散步。');
      recommendations.push('随团配有便携 AED 除颤仪与专职急救护士，请随身带好速效救心丸/硝酸甘油。');
      penalty += 20;
    }
  }

  // 5. 饮食偏好或过敏提示
  if (healthProfile.allergies && healthProfile.allergies.length > 0) {
    recommendations.push(`已为您向随团主厨备注过敏源：${healthProfile.allergies.join('、')}，将提供独立定制分餐。`);
  }

  const safeScore = Math.max(20, 100 - penalty);
  let riskLevel: 'safe' | 'caution' | 'warning' = 'safe';
  let title = '身体状态极佳 · 完美适宜出行';

  if (safeScore < 60) {
    riskLevel = 'warning';
    title = '强度偏高 · 请审慎评估或选择平缓线路';
  } else if (safeScore < 85) {
    riskLevel = 'caution';
    title = '基本适宜 · 需随团管家重点关注护航';
  } else {
    if (reasons.length === 0) {
      reasons.push(
        isGentle
          ? '该活动为适老五星平缓慢步线路（无阶梯平缓石板路），与您的身体机能完全匹配！'
          : '您的健康档案体能良好，活动强度完全在适宜安全区间内。'
      );
      recommendations.push('全程配备持证随团医护、早晚血压监测与 2+1 陆地头等舱大巴，请安心出游。');
    }
  }

  return {
    isCompatible: riskLevel !== 'warning',
    riskLevel,
    title,
    reasons,
    recommendations,
    safeScore,
  };
}
