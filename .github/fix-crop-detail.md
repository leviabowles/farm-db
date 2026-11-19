## Summary

This PR fixes the crop detail page which was directing to incorrect API endpoint `/api/fieldyearcrops/` that doesn't exist in the backend.

## Changes

- **FieldYearCropDetail.js**: Changed `/api/fieldyearcrops/${id}/` to `/api/annualcrops/${id}/`
- **FieldYearCropList.js**: Changed `/api/fieldyearcrops/` to `/api/annualcrops/`

The backend Django API only has endpoints under `/api/annualcrops/`, not `/api/fieldyearcrops/`.

## Testing

To test:
1. Rebuild React frontend: `docker-compose build react && docker-compose up -d react`
2. Navigate to dashboard homepage
3. Click on a crop in 'CURRENTLY PLANTED CROPS' or 'RECENTLY HARVESTED CROPS'
4. The crop detail page should now load with transactions
