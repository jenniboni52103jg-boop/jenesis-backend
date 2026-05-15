import {
    AdEventType,
    RewardedAd,
    RewardedAdEventType,
    TestIds,
} from "react-native-google-mobile-ads";

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-6178698725098646/8791767965";

export const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
});

let loaded = false;

rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
  loaded = true;
  console.log("Rewarded loaded");
});

rewarded.addAdEventListener(AdEventType.CLOSED, () => {
  loaded = false;
  rewarded.load();
});

rewarded.load();

export async function showRewardedAd(
  onReward: () => void
) {
  if (!loaded) {
    console.log("Ad not loaded yet");
    return false;
  }

  rewarded.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    () => {
      console.log("USER EARNED REWARD");
      onReward();
    }
  );

  await rewarded.show();

  return true;
}